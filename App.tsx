
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

  // Check for eager connection (if user previously connected)
  useEffect(() => {
    const checkWallet = async () => {
      // Small delay to ensure extension injection has occurred
      setTimeout(async () => {
        try {
          const provider = getProvider();
          if (provider && provider.isPhantom) {
            // "onlyIfTrusted" prevents the popup if they haven't connected before
            const response = await provider.connect({ onlyIfTrusted: true });
            console.log('Eager connection:', response.publicKey.toString());
            setWalletAddress(response.publicKey.toString());
          }
        } catch (err) {
          // User not trusted yet or no wallet, do nothing silently
        }
      }, 500);
    };

    window.addEventListener('load', checkWallet);
    return () => window.removeEventListener('load', checkWallet);
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
              const confirmInstall = window.confirm('Solana wallet not found! Would you like to visit the Phantom website to install it?');
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