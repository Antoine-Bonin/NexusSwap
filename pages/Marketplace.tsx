
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowRightLeft, Star, Award } from 'lucide-react';
import { getOrders } from '../services/store';
import { TradeOrder, OrderStatus } from '../types';

const Marketplace: React.FC = () => {
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [filterToken, setFilterToken] = useState('ALL');
  const [totalVolume, setTotalVolume] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching from chain/indexer
    const allOrders = getOrders();
    const openOrders = allOrders.filter(o => o.status === OrderStatus.OPEN);
    setOrders(openOrders);
    
    // Calculate pseudo volume (sum of all buy amounts in "USDC" equivalent roughly)
    // For demo, just sum Buy amounts if token is USDC, otherwise ignore for simple math
    const vol = allOrders.reduce((acc, o) => {
        if(o.tokenBuy.symbol === 'USDC') return acc + o.amountBuy;
        if(o.tokenSell.symbol === 'USDC') return acc + o.amountSell;
        // Mock conversion for SOL for demo visual
        if(o.tokenBuy.symbol === 'SOL') return acc + (o.amountBuy * 150);
        return acc;
    }, 0);
    setTotalVolume(vol);

  }, []);

  const filteredOrders = orders.filter(order => {
    if (filterToken === 'ALL') return true;
    return order.tokenSell.symbol === filterToken || order.tokenBuy.symbol === filterToken;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Trustless <span className="text-nexus-primary">OTC Trading</span>
        </h1>
        <p className="text-nexus-accent/80 text-lg max-w-2xl mx-auto">
          Swap any SPL token securely on Solana. No middleman. No KYC. 100% On-Chain Escrow.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-nexus-800/50 p-4 rounded-xl border border-nexus-800 backdrop-blur text-center">
            <p className="text-gray-400 text-sm">Total Vol (24h)</p>
            <p className="text-2xl font-mono font-bold text-white">${totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-nexus-800/50 p-4 rounded-xl border border-nexus-800 backdrop-blur text-center">
            <p className="text-gray-400 text-sm">Active Orders</p>
            <p className="text-2xl font-mono font-bold text-nexus-primary">{orders.length}</p>
        </div>
        <div className="bg-nexus-800/50 p-4 rounded-xl border border-nexus-800 backdrop-blur text-center">
            <p className="text-gray-400 text-sm">Avg. Completion</p>
            <p className="text-2xl font-mono font-bold text-nexus-success">~3m</p>
        </div>
         <div className="bg-nexus-800/50 p-4 rounded-xl border border-nexus-800 backdrop-blur text-center">
            <p className="text-gray-400 text-sm">Escrow Fee</p>
            <p className="text-2xl font-mono font-bold text-nexus-warning">0.08%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center bg-nexus-800 rounded-lg p-1">
          {['ALL', 'SOL', 'USDC', 'BONK'].map(token => (
            <button
              key={token}
              onClick={() => setFilterToken(token)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filterToken === token
                  ? 'bg-nexus-primary text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {token}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search token or wallet..."
            className="w-full bg-nexus-800 border border-nexus-700 text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-nexus-primary focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Order Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            onClick={() => navigate(`/order/${order.id}`)}
            className={`group bg-nexus-800/40 border border-nexus-700 rounded-xl p-6 hover:border-nexus-primary/50 transition-all cursor-pointer relative overflow-hidden ${order.isPremium ? 'ring-1 ring-nexus-warning/20' : ''}`}
          >
            {order.isPremium && (
                <div className="absolute top-0 right-0 bg-nexus-warning text-nexus-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    PREMIUM
                </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img src={order.tokenSell.logoURI} alt={order.tokenSell.symbol} className="w-10 h-10 rounded-full bg-black object-cover" />
                <ArrowRightLeft className="w-5 h-5 text-gray-500" />
                <img src={order.tokenBuy.logoURI} alt={order.tokenBuy.symbol} className="w-10 h-10 rounded-full bg-black object-cover" />
              </div>
              <div className="flex items-center gap-2 text-right">
                <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-nexus-warning text-xs font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {order.makerReputation}
                    </div>
                     <div className="flex items-center justify-end gap-2 mt-1">
                         {order.makerIsEarly && (
                             <span title="Early Adopter" className="flex items-center">
                                 <Award className="w-3 h-3 text-nexus-accent" />
                             </span>
                         )}
                         <p className="text-xs text-gray-400 font-medium">
                            {order.makerName || `${order.maker.slice(0, 4)}...${order.maker.slice(-4)}`}
                         </p>
                    </div>
                </div>
                {order.makerAvatar && (
                    <img src={order.makerAvatar} alt="Maker" className="w-8 h-8 rounded-full border border-nexus-600 bg-nexus-900" />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400 text-sm">Selling</span>
                <span className="text-xl font-bold text-white font-mono">{order.amountSell.toLocaleString()} {order.tokenSell.symbol}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400 text-sm">For</span>
                <span className="text-xl font-bold text-nexus-accent font-mono">{order.amountBuy.toLocaleString()} {order.tokenBuy.symbol}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-nexus-700/50 flex justify-between items-center">
               <span className="text-xs text-gray-500">Rate: {order.rate.toFixed(6)}</span>
               <button className="bg-nexus-800 hover:bg-nexus-primary text-nexus-primary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                 Details
               </button>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
                <p>No open orders found for this filter.</p>
                <button 
                    onClick={() => navigate('/create')}
                    className="mt-4 text-nexus-primary hover:underline"
                >
                    Create the first one!
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
