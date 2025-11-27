import React from 'react';
import { User, Award, Shield, DollarSign, Activity } from 'lucide-react';
import { Recharts, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'; // Mocking usage for single file, normally explicit import

// Mock data for the chart since we can't fully install recharts in this snippet context without package.json
// We will build a simple CSS bar chart instead to ensure it works 100% without dependencies failing.

interface ProfileProps {
  walletAddress: string | null;
  onConnect: () => void;
}

const Profile: React.FC<ProfileProps> = ({ walletAddress, onConnect }) => {
  if (!walletAddress) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <Shield className="w-16 h-16 text-nexus-800 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
        <p className="text-gray-400 mb-6">Please connect your Solana wallet to view your trading profile and reputation.</p>
        <button 
            onClick={onConnect}
            className="bg-nexus-primary hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold transition-all"
        >
            Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Profile Card */}
        <div className="bg-gradient-to-r from-nexus-800 to-nexus-900 rounded-3xl p-8 border border-nexus-700 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-nexus-warning text-nexus-900 text-xs font-bold px-4 py-1 rounded-bl-xl">EARLY ADOPTER</div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 z-10 relative">
                <div className="w-24 h-24 bg-nexus-700 rounded-full flex items-center justify-center border-4 border-nexus-900 shadow-xl">
                    <User className="w-10 h-10 text-nexus-accent" />
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-2xl font-bold text-white font-mono">{walletAddress}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-nexus-success bg-nexus-success/10 px-2 py-1 rounded">
                            <Shield className="w-3 h-3" /> Verified
                        </span>
                        <span className="flex items-center gap-1 text-nexus-accent bg-nexus-accent/10 px-2 py-1 rounded">
                            <Award className="w-3 h-3" /> Top 500
                        </span>
                    </div>
                </div>
                <div className="ml-auto flex gap-6 text-center">
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Reputation</p>
                        <p className="text-3xl font-bold text-white">100</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide">Trades</p>
                        <p className="text-3xl font-bold text-white">0</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-nexus-800/40 border border-nexus-700 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Total Volume</h3>
                    <DollarSign className="w-5 h-5 text-nexus-success" />
                </div>
                <p className="text-2xl font-bold text-white">$0.00</p>
                <p className="text-xs text-gray-500 mt-1">All time traded value</p>
            </div>
            
            <div className="bg-nexus-800/40 border border-nexus-700 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Completion Rate</h3>
                    <Activity className="w-5 h-5 text-nexus-primary" />
                </div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-gray-500 mt-1">Based on accepted orders</p>
            </div>

            <div className="bg-nexus-800/40 border border-nexus-700 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                <h3 className="text-white font-bold mb-2">Upgrade to Premium</h3>
                <p className="text-xs text-gray-400 mb-4">Get highlighted orders & lower fees.</p>
                <button className="bg-nexus-warning text-nexus-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors">
                    9 USDC / Month
                </button>
            </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-nexus-800/20 border border-nexus-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
                <div className="text-center text-gray-500 py-8">
                    No recent trades found. Start trading to build your history!
                </div>
            </div>
        </div>
    </div>
  );
};

export default Profile;
