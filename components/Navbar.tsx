import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Menu, X, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  walletAddress: string | null;
  onConnect: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ walletAddress, onConnect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Market', path: '/' },
    { name: 'Create Order', path: '/create' },
    { name: 'Profile', path: '/profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-nexus-800 bg-nexus-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-nexus-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-nexus-primary to-nexus-accent bg-clip-text text-transparent">
                NexusSwap
                </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-nexus-800 text-nexus-primary'
                      : 'text-gray-300 hover:text-white hover:bg-nexus-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <button
              onClick={onConnect}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-bold transition-all ${
                walletAddress
                  ? 'bg-nexus-800 text-nexus-success border border-nexus-success/30'
                  : 'bg-nexus-primary hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              <Wallet className="h-4 w-4" />
              {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
            </button>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-nexus-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-nexus-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-nexus-900 border-b border-nexus-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-nexus-800 text-nexus-primary'
                    : 'text-gray-300 hover:text-white hover:bg-nexus-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                onConnect();
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-nexus-accent hover:text-white hover:bg-nexus-700"
            >
              <Wallet className="h-5 w-5" />
              {walletAddress ? 'Disconnect' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
