import React from 'react';
import ConnectWallet from '../components/ConnectWallet';

const Home: React.FC = () => {
  return (
    <>
      {/* SECTION 1 - Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white">
        {/* Animated background element */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Borrow Instantly — Backed by Trust Wallet.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light">
            The decentralized credit layer for verified on-chain users.
          </p>

          {/* CTA Button - reuses existing ConnectWallet */}
          <div className="mb-16">
            <div className="inline-block">
              <ConnectWallet />
            </div>
          </div>

          {/* Stat Strip */}
          <div className="max-w-4xl mx-auto">
            <div className="border-t border-b border-gray-200 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#3375BB] mb-2">$12,482,310</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">Total Liquidity</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#3375BB] mb-2">19</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">Active Vaults</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[#3375BB] mb-2">99.4%</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">Repayment Success</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
            3 Steps to Instant Liquidity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Your Wallet',
                description: 'Secure link through Trust Wallet Connect.'
              },
              {
                step: '02',
                title: 'Choose Loan Vault',
                description: 'Select your preferred vault and collateral type.'
              },
              {
                step: '03',
                title: 'Receive Instant Credit',
                description: 'Loan executed on-chain. Tokens land directly in your wallet.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3375BB] to-blue-400 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-6xl font-bold text-gray-100 mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 - Borrower Status System */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
            Earn Status. Unlock Higher Credit Limits.
          </h2>
          <p className="text-center text-gray-600 mb-16 text-lg">Build your on-chain reputation and access exclusive benefits</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                tier: 'Tier I',
                name: 'Verified Borrower',
                gradient: 'from-blue-50 to-blue-100',
                border: 'border-blue-200',
                badge: 'bg-blue-500',
                features: ['Base access', 'Standard rates', 'Community support']
              },
              {
                tier: 'Tier II',
                name: 'Vault Trusted',
                gradient: 'from-gray-50 to-gray-100',
                border: 'border-gray-300',
                badge: 'bg-gray-500',
                features: ['Higher limits', 'Faster approvals', 'Priority support']
              },
              {
                tier: 'Tier III',
                name: 'Institutional',
                gradient: 'from-yellow-50 to-yellow-100',
                border: 'border-yellow-300',
                badge: 'bg-yellow-500',
                features: ['Priority liquidity', 'Exclusive pools', 'Dedicated manager']
              }
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`relative bg-gradient-to-br ${tier.gradient} border ${tier.border} rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
              >
                <div className={`inline-block ${tier.badge} text-white text-xs font-bold px-3 py-1 rounded-full mb-4`}>
                  {tier.tier}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{tier.name}</h3>
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <span className="text-[#3375BB] mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <p className="text-center text-gray-500 italic text-lg">
            Trust isn't given. It's earned — on-chain.
          </p>
        </div>
      </section>
    </>
  );
};

export default Home;