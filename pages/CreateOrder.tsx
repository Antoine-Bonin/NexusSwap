import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, Bot, Loader2, PenLine, List } from 'lucide-react';
import { TOKENS } from '../constants';
import { createOrder } from '../services/store';
import { OrderStatus, Token } from '../types';
import { analyzeMarketPair } from '../services/geminiService';

interface CreateOrderProps {
  walletAddress: string | null;
  onConnect: () => void;
}

// Reusable Token Input Component with Custom Support
const TokenInput = ({ 
  label, 
  amount, 
  token, 
  onAmountChange, 
  onTokenChange,
  accentColor = "text-white"
}: { 
  label: string, 
  amount: number | '', 
  token: Token, 
  onAmountChange: (val: number | '') => void, 
  onTokenChange: (t: Token) => void,
  accentColor?: string
}) => {
  const [isCustom, setIsCustom] = useState(false);
  const [customMint, setCustomMint] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');

  const handleCustomChange = (mint: string, symbol: string) => {
    setCustomMint(mint);
    setCustomSymbol(symbol);
    
    // Update parent immediately
    onTokenChange({
        symbol: symbol.toUpperCase() || 'CUSTOM',
        name: symbol || 'Custom Token',
        mint: mint,
        decimals: 6, // Default for custom mock
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' // Generic fallback
    });
  };

  const toggleCustom = () => {
    const newState = !isCustom;
    setIsCustom(newState);
    
    if (newState) {
        // Switching to Custom: Reset to empty custom state
        setCustomMint('');
        setCustomSymbol('');
        onTokenChange({
            symbol: 'CUSTOM',
            name: 'Custom Token',
            mint: '',
            decimals: 6,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
        });
    } else {
        // Switching back to List: Default to first token (SOL)
        onTokenChange(TOKENS[0]);
    }
  };

  const handlePresetSelect = (symbol: string) => {
      const t = TOKENS.find(x => x.symbol === symbol);
      if(t) onTokenChange(t);
  };

  return (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            <button 
                type="button"
                onClick={toggleCustom}
                className="flex items-center gap-1 text-xs text-nexus-primary hover:text-white transition-colors"
            >
                {isCustom ? <><List className="w-3 h-3"/> Select from List</> : <><PenLine className="w-3 h-3"/> Enter Address</>}
            </button>
        </div>
        
        <div className="flex gap-4">
            <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value === '' ? '' : Number(e.target.value))}
                className={`flex-1 bg-nexus-900 border border-nexus-700 rounded-xl px-4 py-4 text-2xl font-mono ${accentColor} focus:ring-2 focus:ring-nexus-primary outline-none`}
            />
            
            {!isCustom ? (
                 <div className="relative w-32">
                    <select
                        value={TOKENS.some(t => t.mint === token.mint) ? token.symbol : ''}
                        onChange={(e) => handlePresetSelect(e.target.value)}
                        className="w-full h-full bg-nexus-800 border border-nexus-700 rounded-xl px-4 py-2 text-white font-bold focus:outline-none appearance-none cursor-pointer hover:bg-nexus-700 transition-colors"
                    >
                        {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                    </select>
                </div>
            ) : (
                <div className="w-32 flex items-center justify-center bg-nexus-800 border border-nexus-700 rounded-xl">
                    <span className="text-xs font-mono text-nexus-accent font-bold">CUSTOM</span>
                </div>
            )}
        </div>

        {isCustom && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-nexus-900/30 rounded-lg border border-nexus-800 animate-in fade-in slide-in-from-top-2">
                <div className="col-span-3 text-xs text-gray-500 flex justify-between">
                    <span>Custom Token Details</span>
                    <span className="text-[10px] opacity-60">Mock Mode: No RPC validation</span>
                </div>
                <input 
                    type="text"
                    placeholder="Mint Address (e.g. So11...)"
                    value={customMint}
                    onChange={(e) => handleCustomChange(e.target.value, customSymbol)}
                    className="col-span-2 bg-nexus-900 border border-nexus-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-primary placeholder-gray-600 font-mono"
                />
                 <input 
                    type="text"
                    placeholder="Symbol (e.g. PEPE)"
                    value={customSymbol}
                    onChange={(e) => handleCustomChange(customMint, e.target.value)}
                    className="col-span-1 bg-nexus-900 border border-nexus-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-primary placeholder-gray-600 font-mono"
                />
            </div>
        )}
    </div>
  );
};

const CreateOrder: React.FC<CreateOrderProps> = ({ walletAddress, onConnect }) => {
  const navigate = useNavigate();
  const [sellToken, setSellToken] = useState<Token>(TOKENS[0]);
  const [buyToken, setBuyToken] = useState<Token>(TOKENS[1]);
  const [sellAmount, setSellAmount] = useState<number | ''>('');
  const [buyAmount, setBuyAmount] = useState<number | ''>('');
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeMarketPair(sellToken, buyToken);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      onConnect();
      return;
    }
    if (!sellAmount || !buyAmount) return;

    // Basic validation for custom tokens
    if (sellToken.symbol === 'CUSTOM' && !sellToken.mint) {
        alert("Please enter a mint address for the Sell token");
        return;
    }
    if (buyToken.symbol === 'CUSTOM' && !buyToken.mint) {
        alert("Please enter a mint address for the Buy token");
        return;
    }

    const newOrder = {
      id: `ord_${Date.now()}`,
      maker: walletAddress,
      makerReputation: 100, // New users start at 100 for demo
      tokenSell: sellToken,
      amountSell: Number(sellAmount),
      tokenBuy: buyToken,
      amountBuy: Number(buyAmount),
      rate: Number(buyAmount) / Number(sellAmount),
      status: OrderStatus.OPEN,
      createdAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      isPremium: false,
    };

    createOrder(newOrder);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-white mb-8">Create OTC Order</h2>

      <div className="bg-nexus-800/40 border border-nexus-700 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sell Section */}
          <TokenInput 
            label="You Sell"
            amount={sellAmount}
            token={sellToken}
            onAmountChange={setSellAmount}
            onTokenChange={setSellToken}
          />

          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-nexus-700 p-2 rounded-full border-4 border-nexus-900">
              <ArrowDown className="w-5 h-5 text-gray-300" />
            </div>
          </div>

          {/* Buy Section */}
          <TokenInput 
            label="You Receive"
            amount={buyAmount}
            token={buyToken}
            onAmountChange={setBuyAmount}
            onTokenChange={setBuyToken}
            accentColor="text-nexus-accent"
          />

          {/* AI Analysis Button */}
          <div className="bg-nexus-900/50 rounded-lg p-4 border border-nexus-700/50 mt-6">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-nexus-primary">
                    <Bot className="w-5 h-5" />
                    <span className="text-sm font-bold">Gemini Market Advisor</span>
                </div>
                {!aiAnalysis && (
                    <button 
                        type="button"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="text-xs bg-nexus-800 hover:bg-nexus-700 px-3 py-1 rounded-md text-gray-300 transition-colors flex items-center gap-1"
                    >
                        {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin"/> : "Analyze Pair"}
                    </button>
                )}
            </div>
            {aiAnalysis ? (
                <p className="text-sm text-gray-300 italic">"{aiAnalysis}"</p>
            ) : (
                <p className="text-xs text-gray-500">Get AI-powered insights on this trading pair ({sellToken.symbol}/{buyToken.symbol}) before setting your price.</p>
            )}
          </div>

          {/* Summary */}
          <div className="bg-nexus-800/30 rounded-lg p-4 space-y-2 text-sm mt-4">
             <div className="flex justify-between">
                <span className="text-gray-400">Rate</span>
                <span className="text-white font-mono">1 {sellToken.symbol} ≈ {sellAmount && buyAmount ? (Number(buyAmount)/Number(sellAmount)).toFixed(6) : '-'} {buyToken.symbol}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-gray-400">Escrow Fee (0.08%)</span>
                <span className="text-white font-mono">{buyAmount ? (Number(buyAmount) * 0.0008).toFixed(4) : '0'} {buyToken.symbol}</span>
             </div>
          </div>

          <button
            type="submit"
            disabled={!walletAddress && !sellAmount}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              walletAddress
                ? 'bg-nexus-primary hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-nexus-800 text-gray-400 hover:bg-nexus-700'
            }`}
          >
            {walletAddress ? 'Deposit & Create Order' : 'Connect Wallet to Create'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;