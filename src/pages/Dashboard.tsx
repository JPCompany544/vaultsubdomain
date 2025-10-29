import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { calculateLoanFees, executeLoanTransaction } from '../components/handleLoanRequest';
import LoanConfirmModal from '../components/LoanConfirmModal';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  // 🔧 SIMULATION MODE - Set to false to restore real blockchain transactions
  const isSimulationMode = true;
  
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [selectedAsset, setSelectedAsset] = useState<'ETH' | 'USDT'>('USDT');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingLoanAmount, setPendingLoanAmount] = useState<number | null>(null);
  const [activityFeed, setActivityFeed] = useState<string[]>([
    '0x83fA borrowed 5000 USDT',
    '0x5C91 repaid 1.2 ETH loan',
    'Vault liquidity increased by $32,000'
  ]);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [disbursedAmount, setDisbursedAmount] = useState<number>(0);
  const [disbursedAsset, setDisbursedAsset] = useState<string>('USDT');

  // Mock active loans data
  const activeLoans: Array<{
    id: string;
    asset: string;
    amount: number;
    interest: number;
    repaymentDate: string;
  }> = [];

  // Rotate activity feed
  useEffect(() => {
    const activities = [
      '0x83fA borrowed 5000 USDT',
      '0x5C91 repaid 1.2 ETH loan',
      'Vault liquidity increased by $32,000',
      '0x2A4B deposited 2.5 ETH collateral',
      '0x9F3E withdrew 1000 USDT',
      'New vault activated: Pool #7'
    ];
    
    const interval = setInterval(() => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      setActivityFeed(prev => [randomActivity, ...prev.slice(0, 4)]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleBorrow = () => {
    if (!selectedAmount || !address) {
      setToastMessage('⚠️ Please select a loan amount.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    
    // Wallet client check only needed in real mode
    if (!isSimulationMode && !walletClient) {
      setToastMessage('⚠️ Wallet not connected.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    
    // Open modal with loan details
    setPendingLoanAmount(selectedAmount);
    setShowModal(true);
  };

  const handleConfirmLoan = async () => {
    if (!pendingLoanAmount || !address) return;
    
    setShowModal(false);
    
    // Show loading modal immediately
    setShowLoadingModal(true);
    
    if (isSimulationMode) {
      // 🎭 SIMULATION MODE: 3-second delay then show success
      setTimeout(() => {
        // Hide loading modal
        setShowLoadingModal(false);
        
        // Set disbursed loan details
        setDisbursedAmount(pendingLoanAmount);
        setDisbursedAsset(selectedAsset);
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Reset pending loan amount
        setPendingLoanAmount(null);
        setSelectedAmount(null);
      }, 3000);
    } else {
      // 🔗 REAL BLOCKCHAIN MODE: Execute actual on-chain transaction
      // Uncomment when ready to restore real functionality
      /*
      if (!walletClient) return;
      
      await executeLoanTransaction(
        walletClient,
        address,
        pendingLoanAmount,
        (txHash) => {
          // Transaction successful - hide loading modal
          setShowLoadingModal(false);
          
          // Set disbursed loan details
          setDisbursedAmount(pendingLoanAmount);
          setDisbursedAsset(selectedAsset);
          
          // Show success modal
          setShowSuccessModal(true);
          
          // Reset pending loan amount
          setPendingLoanAmount(null);
          setSelectedAmount(null);
        },
        (error) => {
          // Transaction failed or canceled - hide loading modal
          setShowLoadingModal(false);
          
          // Show error toast
          setToastMessage(`❌ Transaction canceled or failed. Please try again.`);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 5000);
          
          // Reset pending loan amount
          setPendingLoanAmount(null);
        }
      );
      */
    }
  };

  const handleCancelLoan = () => {
    setShowModal(false);
    setPendingLoanAmount(null);
  };

  const handleRepay = async (loanId: string, amount: number) => {
    if (!walletClient || !address) return;
    
    // Execute repayment transaction
    await executeLoanTransaction(
      walletClient,
      address,
      amount,
      (txHash) => {
        setToastMessage(`Loan settled. Contract confirmation: ${loanId}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      },
      (error) => {
        setToastMessage(`❌ Repayment failed: ${error}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
    );
  };

  // Get fee breakdown for modal
  const feeBreakdown = pendingLoanAmount ? calculateLoanFees(pendingLoanAmount) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* Loan Confirmation Modal */}
        {feeBreakdown && (
          <LoanConfirmModal
            isOpen={showModal}
            onClose={handleCancelLoan}
            onConfirm={handleConfirmLoan}
            loanAmount={pendingLoanAmount || 0}
            totalFee={feeBreakdown.totalFee}
            feeBreakdown={{
              processingFee: feeBreakdown.processingFee,
              networkFee: feeBreakdown.networkFee,
              platformFee: feeBreakdown.platformFee
            }}
          />
        )}

        {/* Loading Modal */}
        {showLoadingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-[90%] md:max-w-md border-2 border-[#3375BB]/20 animate-scale-in">
              <div className="text-center">
                <div className="mb-4">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#3375BB]"></div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Processing Transaction</h3>
                <p className="text-sm md:text-base text-gray-600">{isSimulationMode ? 'Simulating loan disbursement...' : 'Please confirm in your wallet...'}</p>
                <div className="mt-4 flex justify-center gap-1">
                  <div className="w-2 h-2 bg-[#3375BB] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#3375BB] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#3375BB] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-[90%] md:max-w-md border-2 border-green-500/20 animate-scale-in">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Loan Disbursed Successfully</h3>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  Disbursed to: <span className="font-mono font-semibold text-[#3375BB]">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </p>
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 md:p-5 border-2 border-green-200 mb-6">
                  <p className="text-xs md:text-sm text-gray-600 mb-1">Loan Amount</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">${disbursedAmount.toLocaleString()} <span className="text-lg text-gray-600">{disbursedAsset}</span></p>
                </div>
                <p className="text-xs md:text-sm text-gray-500 mb-6 flex items-center justify-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {isSimulationMode ? 'Simulation mode active' : 'Transaction verified on-chain'}
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gradient-to-r from-[#3375BB] to-blue-600 hover:from-blue-600 hover:to-[#3375BB] hover:shadow-xl text-white font-bold py-3 md:py-4 rounded-xl transition-all transform hover:scale-[1.02]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. Vault Overview Panel */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent animate-shimmer" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Loan Overview</h2>
                  <p className="text-sm text-gray-500 mt-1">Tier I — Verified Borrower</p>
                </div>
                <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  TIER I
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-500 mb-1">Active Loans</p>
                  <p className="text-3xl font-bold text-gray-900">{activeLoans.length}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-500 mb-1">Collateral Ratio</p>
                  <p className="text-3xl font-bold text-gray-900">10%</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-500 mb-1">Next Repayment</p>
                  <p className="text-3xl font-bold text-gray-900">-</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-500 mb-1">Credit Limit</p>
                  <p className="text-3xl font-bold text-[#3375BB]">$25,000</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Borrow Module + Loan Management */}
          <div className="lg:col-span-2 space-y-8">
            {/* 2. Borrow Module */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Borrow Assets</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Choose Asset */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose Asset</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedAsset('ETH')}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        selectedAsset === 'ETH'
                          ? 'border-[#3375BB] bg-blue-50 text-[#3375BB]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold">ETH</div>
                      <div className="text-xs text-gray-500">Ethereum</div>
                    </button>
                    <button
                      onClick={() => setSelectedAsset('USDT')}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        selectedAsset === 'USDT'
                          ? 'border-[#3375BB] bg-blue-50 text-[#3375BB]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold">USDT</div>
                      <div className="text-xs text-gray-500">Tether</div>
                    </button>
                  </div>
                </div>

                {/* Select Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Amount (USDT)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 2500, 5000, 10000, 15000, 20000, 25000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`py-2 px-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                          selectedAmount === amount
                            ? 'border-[#3375BB] bg-blue-50 text-[#3375BB]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title="Requires 10% wallet collateral"
                      >
                        ${amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Collateral Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ <span className="font-semibold">Collateral Required:</span> Your wallet must hold at least 10% of the loan amount. These funds will be locked until the loan is repaid.
                </p>
              </div>

              {/* Authorize Button */}
              <button
                onClick={handleBorrow}
                disabled={!selectedAmount}
                className="w-full bg-gradient-to-r from-[#3375BB] to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Authorize in Wallet
              </button>
            </div>

            {/* 3. Loan Management Module */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Active Loans</h3>
              
              {activeLoans.length > 0 ? (
                <div className="space-y-4">
                  {activeLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{loan.id}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">{loan.asset}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Amount</p>
                              <p className="font-bold text-gray-900">${loan.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Interest Accrued</p>
                              <p className="font-bold text-orange-600">${loan.interest.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Repayment Date</p>
                              <p className="font-bold text-gray-900">{loan.repaymentDate}</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRepay(loan.id, loan.amount + loan.interest)}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        >
                          Repay Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg">No active loans</p>
                  <p className="text-sm mt-2">Borrow assets to see your vaults here</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Transparency Stream */}
          <div className="lg:col-span-1">
            {/* 4. Transparency Stream */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Live Activity</h3>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityFeed.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors animate-fade-in"
                  >
                    <div className="w-8 h-8 bg-[#3375BB] rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{activity}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 text-center">All verified On-chain</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Analytics Overview */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Analytics Overview</h3>
            
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-600 mb-2">Liquidity Utilization Rate</p>
                <p className="text-4xl font-bold text-[#3375BB]">82.4%</p>
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#3375BB] rounded-full" style={{ width: '82.4%' }} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100">
                <p className="text-sm text-gray-600 mb-2">Average Loan Size</p>
                <p className="text-4xl font-bold text-green-600">$8,930</p>
                <p className="text-xs text-green-600 mt-2">↑ 12% from last week</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600 mb-2">Pool Health</p>
                <p className="text-4xl font-bold text-purple-600">Strong</p>
                <div className="flex gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-1 h-2 bg-purple-500 rounded-full" />
                  ))}
                </div>
              </div>
            </div>

            {/* Chart - 24h Loan Volume */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">24h Loan Volume</h4>
                <p className="text-xs text-gray-500">Last Updated: 32s ago</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: '00h', volume: 420 },
                      { name: '04h', volume: 380 },
                      { name: '08h', volume: 690 },
                      { name: '12h', volume: 850 },
                      { name: '16h', volume: 560 },
                      { name: '20h', volume: 760 },
                      { name: '24h', volume: 910 },
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      style={{ fontSize: '12px' }}
                      tickLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => [`${value} ETH`, 'Volume']}
                      labelStyle={{ color: '#374151', fontWeight: 600 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorVolume)"
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}} />
    </div>
  );
};

export default Dashboard;
