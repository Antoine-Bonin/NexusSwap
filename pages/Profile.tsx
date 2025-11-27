
import React, { useState, useEffect } from 'react';
import { User, Award, Shield, DollarSign, Activity, Edit2, Save } from 'lucide-react';
import { UserProfile } from '../types';
import { getUserProfile, updateUserProfile } from '../services/store';

interface ProfileProps {
  walletAddress: string | null;
  onConnect: () => void;
}

const Profile: React.FC<ProfileProps> = ({ walletAddress, onConnect }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  useEffect(() => {
    if (walletAddress) {
        const p = getUserProfile(walletAddress);
        setProfile(p);
        setEditName(p.displayName || '');
        setEditAvatar(p.avatarUrl || '');
    }
  }, [walletAddress]);

  const handleSave = () => {
      if (!profile) return;
      const updated: UserProfile = {
          ...profile,
          displayName: editName,
          avatarUrl: editAvatar
      };
      updateUserProfile(updated);
      setProfile(updated);
      setIsEditing(false);
  };

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

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Profile Card */}
        <div className="bg-gradient-to-r from-nexus-800 to-nexus-900 rounded-3xl p-8 border border-nexus-700 mb-8 relative overflow-hidden group">
            {profile.isEarlyAdopter && (
                <div className="absolute top-0 right-0 bg-nexus-warning text-nexus-900 text-xs font-bold px-4 py-1 rounded-bl-xl z-20 flex items-center gap-1">
                    <Award className="w-3 h-3" /> EARLY ADOPTER
                </div>
            )}
            
            <div className="flex flex-col md:flex-row items-center gap-6 z-10 relative">
                <div className="relative">
                    <img 
                        src={profile.avatarUrl} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full border-4 border-nexus-900 shadow-xl bg-nexus-700 object-cover" 
                        onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${walletAddress}` }}
                    />
                </div>
                
                <div className="text-center md:text-left flex-1">
                    {isEditing ? (
                        <div className="space-y-3 max-w-xs">
                            <input 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Display Name"
                                className="w-full bg-nexus-900 border border-nexus-600 rounded px-3 py-1 text-white font-bold"
                            />
                            <input 
                                type="text"
                                value={editAvatar}
                                onChange={(e) => setEditAvatar(e.target.value)}
                                placeholder="Avatar URL"
                                className="w-full bg-nexus-900 border border-nexus-600 rounded px-3 py-1 text-white text-xs"
                            />
                        </div>
                    ) : (
                        <>
                             <h1 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
                                {profile.displayName}
                                <span className="text-gray-500 text-sm font-mono font-normal">({walletAddress.slice(0,4)}...{walletAddress.slice(-4)})</span>
                            </h1>
                        </>
                    )}
                   
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-nexus-success bg-nexus-success/10 px-2 py-1 rounded">
                            <Shield className="w-3 h-3" /> Verifiable on-chain
                        </span>
                        {profile.isEarlyAdopter && (
                             <span className="flex items-center gap-1 text-nexus-accent bg-nexus-accent/10 px-2 py-1 rounded">
                                <Award className="w-3 h-3" /> Top 500
                            </span>
                        )}
                    </div>
                </div>

                <div className="ml-auto flex gap-6 text-center">
                    <div>
                        <button 
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className="flex items-center gap-2 bg-nexus-800 hover:bg-nexus-700 border border-nexus-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-nexus-800/40 border border-nexus-700 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Reputation Score</h3>
                    <Award className="w-5 h-5 text-nexus-warning" />
                </div>
                <p className="text-3xl font-bold text-white">{profile.reputationScore}</p>
                <p className="text-xs text-gray-500 mt-1">Based on successful trades</p>
            </div>
            
            <div className="bg-nexus-800/40 border border-nexus-700 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium">Trades Completed</h3>
                    <Activity className="w-5 h-5 text-nexus-primary" />
                </div>
                <p className="text-3xl font-bold text-white">{profile.tradesCompleted}</p>
                <p className="text-xs text-gray-500 mt-1">Total successful swaps</p>
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
