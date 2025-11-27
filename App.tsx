import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Marketplace from './pages/Marketplace';
import CreateOrder from './pages/CreateOrder';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Simulate wallet persistence
  useEffect(() => {
    const saved = localStorage.getItem('nexus_wallet');
    if (saved) setWalletAddress(saved);
  }, []);

  const handleConnect = () => {
    if (walletAddress) {
        setWalletAddress(null);
        localStorage.removeItem('nexus_wallet');
    } else {
        // Simulate connection delay
        const mockAddress = '8xLt...9kQ2'; // Simplified mock address
        setTimeout(() => {
            setWalletAddress(mockAddress);
            localStorage.setItem('nexus_wallet', mockAddress);
        }, 500);
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-nexus-900 text-gray-100 font-sans selection:bg-nexus-primary selection:text-white">
        <Navbar walletAddress={walletAddress} onConnect={handleConnect} />
        
        <main>
          <Routes>
            <Route path="/" element={<Marketplace />} />
            <Route path="/create" element={<CreateOrder walletAddress={walletAddress} onConnect={handleConnect} />} />
            <Route path="/order/:id" element={<OrderDetails walletAddress={walletAddress} onConnect={handleConnect} />} />
            <Route path="/profile" element={<Profile walletAddress={walletAddress} onConnect={handleConnect} />} />
          </Routes>
        </main>
        
        <footer className="border-t border-nexus-800 mt-20 py-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 NexusSwap. Built on Solana.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
