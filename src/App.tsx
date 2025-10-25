// App.tsx
import './styles.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ConnectWallet from './components/ConnectWallet';
import { useAccount, useDisconnect } from 'wagmi';
import LiveChat from './components/LiveChat';
import OnboardingModal from './components/OnboardingModal';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

// Component to handle navigation on wallet connect
const AppContent: React.FC = () => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Navigate to dashboard when wallet connects, navigate to home when disconnects
  useEffect(() => {
    if (mounted) {
      if (isConnected) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isConnected, mounted, navigate]);

  useEffect(() => {
    setMounted(true);
    
    // Clear any wallet connection state on app mount to prevent auto-reconnect
    sessionStorage.removeItem('wagmi-user-connect');
    try {
      localStorage.removeItem('wagmi.store');
      localStorage.removeItem('wagmi.cache');
      localStorage.removeItem('wagmi.wallet');
      localStorage.removeItem('wagmi.connected');
    } catch (_) {}
    
    // Force disconnect if wallet is connected on mount (auto-reconnect prevention)
    if (isConnected) {
      console.log('🔄 App mount: Force disconnecting to prevent auto-reconnect');
      disconnect();
    }

    // TODO: re-enable onboarding flag after testing
    // Check if user has completed onboarding
    // if (!localStorage.getItem('hasCompletedOnboarding')) {
    //   setShowOnboarding(true);
    // }

    // Temporarily disable onboarding for testing
    // setShowOnboarding(true);

    // ✅ Inject Tawk.to chat widget
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();
    
    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/68fc787cdea144195f593cdb/1j8d3dafo';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode?.insertBefore(s1, s0);

    // 🚨 Error handler for script issues (already in your code)
    const errorHandler = (e: ErrorEvent) => {
      const target = e.target || (e as any).srcElement;
      if (target && (target as HTMLElement).tagName === 'SCRIPT') {
        console.error('🚨 Script failed to load or invalid JS:', {
          src: (target as HTMLScriptElement).src,
          outerHTML: (target as HTMLElement).outerHTML,
          message: e.message,
          error: e.error
        });

        fetch((target as HTMLScriptElement).src)
          .then(res => res.text())
          .then(body => {
            if (body.startsWith('<')) {
              console.warn('❗ This script returned HTML instead of JS:', (target as HTMLScriptElement).src);
              console.log('Returned content:\n', body.slice(0, 500));
            }
          })
          .catch(fetchErr => {
            console.error('Failed to fetch script for inspection:', fetchErr);
          });
      }
    };

    window.addEventListener('error', errorHandler, true);

    return () => {
      window.removeEventListener('error', errorHandler, true);
    };
  }, []);

  const handleOnboardingComplete = (): void => {
    // TODO: re-enable onboarding flag after testing
    // localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  if (!mounted) return <></>;

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      <div className="app">
        {/* Navbar */}
        <header className="navbar">
          <div className="logo">TrustLoan</div>
          <nav className="nav-links">
            <a href="#how-it-works">How it Works</a>
            <a href="#loan-offers">Loan Offers</a>
            <a href="#faq">FAQ</a>
          </nav>
          {/* ✅ Connect Wallet Button in navbar */}
          <ConnectWallet />
        </header>

        {/* Main Content - Routes */}
        <main className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/dashboard" 
              element={isConnected ? <Dashboard /> : <Navigate to="/" replace />} 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-left">
              <h2 className="footer-logo">TrustLoan</h2>
              <p>Empowering decentralized access to instant loans. No paperwork. No delay.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Navigate</h4>
                <a href="#how-it-works">How it Works</a>
                <a href="#loan-offers">Loan Offers</a>
                <a href="#faq">FAQ</a>
              </div>
              <div className="footer-column">
                <h4>Connect</h4>
                <a href="https://t.me/tsupportteam01" target="_blank" rel="noopener noreferrer">Telegram</a>
                <a href="#">Twitter</a>
                <a href="#">Contact Support</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Xylon — All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

// Main App component with Router
function App(): React.ReactElement {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
