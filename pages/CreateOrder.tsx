import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, Bot, Loader2, PenLine, List, Search } from 'lucide-react';
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
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  // Auto-fetch metadata from DexScreener when mint changes
  useEffect(() => {
    const fetchMetadata = async () => {
        if (!isCustom || customMint.length < 32) return;

        setIsFetchingMeta(true);
        try {
            const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${customMint}`);
            const data = await response.json();

            if (data.pairs && data.pairs.length > 0) {
                // Find the pair where the base token matches our mint
                const pair = data.pairs[0];
                const baseToken = pair.baseToken;
                const info = pair.info;

                if (baseToken && baseToken.address === customMint) {
                    const symbol = baseToken.symbol;
                    const name = baseToken.name;
                    // DexScreener V1 API: check info.imageUrl or construct CDN url
                    const imageUrl = info?.imageUrl || `https://dd.dexscreener.com/ds-data/tokens/solana/${customMint}.png`;

                    setCustomSymbol(symbol);
                    
                    onTokenChange({
                        symbol: symbol,
                        name: name || 'Custom Token',
                        mint: customMint,
                        decimals: 6, // Default fallback
                        logoURI: imageUrl
                    });
                }
            } else {
                 // Fallback if not found on DexScreener, use generic
                 // We keep the mint but maybe can't find symbol
            }
        } catch (error) {
            console.error("Failed to fetch token metadata", error);
        } finally {
            setIsFetchingMeta(false);
        }
    };

    const timeoutId = setTimeout(() => {
        fetchMetadata();
    }, 800); // Debounce 800ms

    return () => clearTimeout(timeoutId);
  }, [customMint, isCustom]);

  const handleCustomMintChange = (val: string) => {
      setCustomMint(val);
      // Immediate update for mint, keep previous symbol until fetch completes or user types
      onTokenChange({
          ...token,
          mint: val,
          // If we are clearing input, reset symbol to CUSTOM
          symbol: val ? (token.symbol === 'SOL' ? 'CUSTOM' : token.symbol) : 'CUSTOM'
      });
  };

  const handleCustomSymbolChange = (val: string) => {
      setCustomSymbol(val);
      onTokenChange({
          ...token,
          symbol: val.toUpperCase(),
          name: val
      });
  };

  const toggleCustom = () => {
    const newState = !isCustom;
    setIsCustom(newState);
    
    if (newState) {
        // Switching to Custom
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
                 <div className="relative w-36">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                         <img src={token.logoURI} alt="" className="w-6 h-6 rounded-full" />
                    </div>
                    <select
                        value={TOKENS.some(t => t.mint === token.mint) ? token.symbol : ''}
                        onChange={(e) => handlePresetSelect(e.target.value)}
                        className="w-full h-full bg-nexus-800 border border-nexus-700 rounded-xl pl-12 pr-4 py-2 text-white font-bold focus:outline-none appearance-none cursor-pointer hover:bg-nexus-700 transition-colors"
                    >
                        {TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
                    </select>
                </div>
            ) : (
                <div className="w-36 flex items-center justify-center bg-nexus-800 border border-nexus-700 rounded-xl relative overflow-hidden">
                    {token.logoURI && token.logoURI !== 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' && (
                        <img src={token.logoURI} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                    )}
                    <span className="text-sm font-mono text-nexus-accent font-bold relative z-10 truncate px-2">
                        {token.symbol || 'CUSTOM'}
                    </span>
                </div>
            )}
        </div>

        {isCustom && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-nexus-900/30 rounded-lg border border-nexus-800 animate-in fade-in slide-in-from-top-2 relative">
                <div className="col-span-3 text-xs text-gray-500 flex justify-between items-center">
                    <span>Token Address</span>
                    {isFetchingMeta && <span className="flex items-center gap-1 text-nexus-primary"><Loader2 className="w-3 h-3 animate-spin"/> Fetching info...</span>}
                </div>
                <input 
                    type="text"
                    placeholder="Mint Address (e.g. So11...)"
                    value={customMint}
                    onChange={(e) => handleCustomMintChange(e.target.value)}
                    className="col-span-2 bg-nexus-900 border border-nexus-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-nexus-primary placeholder-gray-600 font-mono"
                />
                 <input 
                    type="text"
                    placeholder="Symbol"
                    value={customSymbol}
                    onChange={(e) => handleCustomSymbolChange(e.target.value)}
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