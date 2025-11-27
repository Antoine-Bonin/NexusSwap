import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Marketplace from './pages/Marketplace';
import CreateOrder from './pages/CreateOrder';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Helper function to robustly get the Solana provider
  const getProvider = () => {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }
    }

    const { solana } = window;
    if (solana?.isPhantom) {
      return solana;
    }
    
    // Fallback: Return solana object if it exists (for other wallets like Solflare)
    return solana;
  };

  // Poll for wallet availability (handles delayed injection)
  useEffect(() => {
    let intervalId: any;
    let attempts = 0;

    const checkWallet = async () => {
      attempts++;
      const provider = getProvider();
      
      if (provider) {
        clearInterval(intervalId); // Stop polling once found
        
        // Attempt eager connection if trusted
        try {
           // We only auto-connect if the app is already trusted by the wallet
           if(provider.isPhantom) {
             const response = await provider.connect({ onlyIfTrusted: true });
             console.log('Eager connection:', response.publicKey.toString());
             setWalletAddress(response.publicKey.toString());
           }
        } catch (e) {
           // Not trusted yet, waiting for user to click Connect
        }
      }

      // Stop polling after 5 seconds to save resources
      if (attempts > 10) {
          clearInterval(intervalId);
      }
    };
    
    // Check every 500ms
    intervalId = setInterval(checkWallet, 500);
    checkWallet(); // Initial check

    return () => clearInterval(intervalId);
  }, []);

  const handleConnect = async () => {
    const provider = getProvider();

    if (walletAddress) {
      // Disconnect Logic
      try {
        if (provider) {
            await provider.disconnect();
            setWalletAddress(null);
        }
      } catch (err) {
          console.error("Disconnect error", err);
      }
    } else {
      // Connect Logic
      if (!provider) {
          // Check if we are in an iframe (often blocks wallet injection)
          const isIframe = window.self !== window.top;
          if (isIframe) {
              alert('Solana wallets cannot be detected inside this preview frame. Please open the app in a new tab/window to connect.');
          } else {
              // Only prompt to install if we truly can't find it after the polling period
              const confirmInstall = window.confirm('Solana wallet not found! Please ensure you have Phantom or Solflare installed and try refreshing the page.\n\nWould you like to visit the Phantom website?');
              if (confirmInstall) {
                  window.open('https://phantom.app/', '_blank');
              }
          }
          return;
      }

      try {
          const response = await provider.connect();
          console.log('Connected to wallet:', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
      } catch (err) {
          console.error("User rejected connection", err);
      }
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