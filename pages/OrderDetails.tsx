import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, CheckCircle, AlertTriangle, Send, User, Bot } from 'lucide-react';
import { getOrderById, updateOrderStatus, getChatMessages, addChatMessage } from '../services/store';
import { generateTradingTip } from '../services/geminiService';
import { TradeOrder, OrderStatus, ChatMessage } from '../types';

interface OrderDetailsProps {
  walletAddress: string | null;
  onConnect: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ walletAddress, onConnect }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<TradeOrder | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [programLogs, setProgramLogs] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch Order and Messages
  useEffect(() => {
    if (id) {
      const o = getOrderById(id);
      if (o) {
        setOrder(o);
        setMessages(getChatMessages(id));
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Taking Order
  const handleTakeOrder = async () => {
    if (!walletAddress) {
        onConnect();
        return;
    }
    if (!order) return;

    setIsProcessing(true);
    addLog("Program: NexusSwap Program ID invoked");
    addLog("Instruction: InitializeEscrow");
    
    setTimeout(async () => {
        addLog("Instruction: Transfer (Taker -> Escrow PDA)");
        addLog("Success: Funds Locked");
        updateOrderStatus(order.id, OrderStatus.LOCKED, walletAddress);
        setOrder({ ...order, status: OrderStatus.LOCKED, taker: walletAddress });
        
        // Add System Message
        const sysMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'System',
            text: `Order locked by ${walletAddress.slice(0,6)}... Funds are secure in escrow.`,
            timestamp: Date.now(),
            isSystem: true
        };
        addChatMessage(order.id, sysMsg);
        setMessages(prev => [...prev, sysMsg]);
        
        // Gemini Tip
        const tip = await generateTradingTip("escrow lock phase");
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'Gemini AI',
            text: tip,
            timestamp: Date.now(),
            isSystem: true
        };
        addChatMessage(order.id, aiMsg);
        setMessages(prev => [...prev, aiMsg]);
        
        setIsProcessing(false);
    }, 2000);
  };

  const handleConfirm = () => {
    if(!order) return;
    setIsProcessing(true);
    addLog("Instruction: ApproveRelease");
    
    setTimeout(() => {
        addLog("Instruction: Transfer (Escrow PDA -> Participants)");
        addLog("Event: TradeCompleted");
        updateOrderStatus(order.id, OrderStatus.COMPLETED);
        setOrder({ ...order, status: OrderStatus.COMPLETED });
        
         const sysMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'System',
            text: `Trade Successfully Completed! Reputation scores updated.`,
            timestamp: Date.now(),
            isSystem: true
        };
        addChatMessage(order.id, sysMsg);
        setMessages(prev => [...prev, sysMsg]);

        setIsProcessing(false);
    }, 2000);
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !walletAddress || !order) return;

    const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: walletAddress,
        text: inputText,
        timestamp: Date.now()
    };
    
    addChatMessage(order.id, newMsg);
    setMessages([...messages, newMsg]);
    setInputText('');
  };

  const addLog = (log: string) => {
    setProgramLogs(prev => [...prev, `> ${new Date().toLocaleTimeString()} ${log}`]);
  };

  if (!order) return <div className="p-10 text-center text-white">Loading order details...</div>;

  const isMaker = walletAddress === order.maker;
  const isTaker = walletAddress === order.taker;
  const canChat = order.status !== OrderStatus.OPEN || isMaker;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Escrow Status & Details */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Status Header */}
        <div className="bg-nexus-800/60 border border-nexus-700 rounded-2xl p-6 backdrop-blur-md flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">Order #{order.id.slice(-6)}</h1>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === OrderStatus.OPEN ? 'bg-blue-100 text-blue-800' :
                        order.status === OrderStatus.LOCKED ? 'bg-yellow-100 text-yellow-800' :
                        order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {order.status}
                    </span>
                    <span className="text-gray-400 text-sm">Created {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            {order.status === OrderStatus.OPEN && (
                 <button 
                    onClick={handleTakeOrder}
                    disabled={isProcessing || isMaker}
                    className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${
                        isMaker ? 'bg-gray-600 cursor-not-allowed' : 'bg-nexus-primary hover:bg-indigo-600 shadow-lg shadow-indigo-500/20'
                    }`}
                >
                    {isProcessing ? 'Interacting with Chain...' : isMaker ? 'Waiting for Taker' : 'Accept Trade (Lock Funds)'}
                 </button>
            )}
             {order.status === OrderStatus.LOCKED && (
                 <button 
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className="px-6 py-3 rounded-xl font-bold text-white bg-nexus-success hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                    {isProcessing ? 'Releasing...' : 'Confirm & Release Funds'}
                 </button>
            )}
        </div>

        {/* Trade Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Maker Side */}
             <div className={`p-6 rounded-2xl border ${order.status !== OrderStatus.OPEN ? 'bg-nexus-800/80 border-nexus-success/50' : 'bg-nexus-800/40 border-nexus-700'} relative overflow-hidden`}>
                {order.status !== OrderStatus.OPEN && <div className="absolute top-0 right-0 bg-nexus-success text-nexus-900 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1"><CheckCircle className="w-3 h-3"/> FUNDS LOCKED</div>}
                <div className="flex items-center gap-3 mb-4">
                     <img src={order.tokenSell.logoURI} alt="" className="w-12 h-12 rounded-full" />
                     <div>
                        <p className="text-sm text-gray-400">Maker Sends</p>
                        <p className="text-xl font-bold text-white">{order.amountSell} {order.tokenSell.symbol}</p>
                     </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-mono bg-nexus-900/50 p-2 rounded">
                    <User className="w-4 h-4" />
                    {order.maker}
                </div>
             </div>

             {/* Taker Side */}
             <div className={`p-6 rounded-2xl border ${order.status === OrderStatus.LOCKED || order.status === OrderStatus.COMPLETED ? 'bg-nexus-800/80 border-nexus-success/50' : 'bg-nexus-800/40 border-dashed border-nexus-600'} relative`}>
                {(order.status === OrderStatus.LOCKED || order.status === OrderStatus.COMPLETED) && (
                    <div className="absolute top-0 right-0 bg-nexus-success text-nexus-900 text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1"><CheckCircle className="w-3 h-3"/> FUNDS LOCKED</div>
                )}
                <div className="flex items-center gap-3 mb-4">
                     <img src={order.tokenBuy.logoURI} alt="" className="w-12 h-12 rounded-full" />
                     <div>
                        <p className="text-sm text-gray-400">Taker Sends</p>
                        <p className="text-xl font-bold text-white">{order.amountBuy} {order.tokenBuy.symbol}</p>
                     </div>
                </div>
                {order.taker ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-mono bg-nexus-900/50 p-2 rounded">
                        <User className="w-4 h-4" />
                        {order.taker}
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 italic p-2">Waiting for taker...</div>
                )}
             </div>
        </div>
        
        {/* On-Chain Logs */}
        <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto border border-nexus-800">
            <div className="text-gray-500 mb-2 border-b border-gray-800 pb-1">Program Logs (Mainnet Beta)</div>
            {programLogs.length === 0 && <span className="text-gray-600 opacity-50">Waiting for transaction interaction...</span>}
            {programLogs.map((log, i) => (
                <div key={i}>{log}</div>
            ))}
        </div>

      </div>

      {/* Right Column: Encrypted Chat */}
      <div className="bg-nexus-800/40 border border-nexus-700 rounded-2xl flex flex-col h-[600px] backdrop-blur-sm">
        <div className="p-4 border-b border-nexus-700 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-nexus-success" />
                Encrypted Chat
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1">
                <Shield className="w-3 h-3" /> E2EE
            </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10 text-sm">
                    <p>Start the conversation securely.</p>
                    <p className="text-xs mt-2">Messages are encrypted with x25519-xsalsa20-poly1305.</p>
                </div>
            )}
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === walletAddress ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                        msg.isSystem ? 'bg-nexus-700/50 text-nexus-accent text-center w-full mx-auto italic' :
                        msg.sender === walletAddress 
                            ? 'bg-nexus-primary text-white rounded-br-none' 
                            : 'bg-nexus-800 text-gray-200 rounded-bl-none'
                    }`}>
                        {!msg.isSystem && <div className="text-[10px] opacity-50 mb-1">{msg.sender === walletAddress ? 'Me' : msg.sender === 'Gemini AI' ? 'Gemini AI' : `${msg.sender.slice(0,4)}...`}</div>}
                        {msg.text}
                    </div>
                </div>
            ))}
            <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-nexus-700">
            <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={!canChat || !walletAddress}
                    placeholder={!walletAddress ? "Connect wallet to chat" : "Type a message..."}
                    className="flex-1 bg-nexus-900 border border-nexus-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-nexus-primary"
                />
                <button 
                    type="submit" 
                    disabled={!canChat || !walletAddress}
                    className="bg-nexus-800 hover:bg-nexus-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
