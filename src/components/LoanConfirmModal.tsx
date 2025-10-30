import React from 'react';

interface LoanConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loanAmount: number;
  totalFee: number;
  feeBreakdown: {
    processingFee: number;
    networkFee: number;
    platformFee: number;
  };
}

const LoanConfirmModal: React.FC<LoanConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loanAmount,
  totalFee,
  feeBreakdown
}) => {
  if (!isOpen) return null;

  // Calculate 9% of loan amount as total collateral fee
  const calculatedTotalFee = (loanAmount * 0.09).toFixed(2);
  
  // Break down the fee: 50% Processing, 30% Network, 20% Platform
  const calculatedProcessingFee = (loanAmount * 0.09 * 0.50).toFixed(2);
  const calculatedNetworkFee = (loanAmount * 0.09 * 0.30).toFixed(2);
  const calculatedPlatformFee = (loanAmount * 0.09 * 0.20).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md md:w-full w-[90%] max-w-sm md:max-w-md border-2 border-[#3375BB]/20 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3375BB] to-blue-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-t-2xl">
          <h3 className="text-lg md:text-xl font-bold">Loan Request Confirmation</h3>
          <p className="text-xs md:text-sm text-blue-100 mt-1">Review details before proceeding</p>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Loan Amount */}
          <div className="bg-blue-50 rounded-xl p-3 md:p-4 border border-blue-100">
            <p className="text-xs md:text-sm text-gray-600 mb-1">Loan Amount</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">${loanAmount.toLocaleString()}</p>
          </div>

          {/* Fee Breakdown */}
          <div>
            <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
              <span className="text-[#3375BB]">💰</span>
              Fee Breakdown
            </h4>
            <div className="space-y-2 bg-gray-50 rounded-xl p-3 md:p-4">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-semibold text-gray-900">{calculatedProcessingFee} ETH</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-600">Network Fee</span>
                <span className="font-semibold text-gray-900">{calculatedNetworkFee} ETH</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-semibold text-gray-900">{calculatedPlatformFee} ETH</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-sm md:text-base font-bold text-gray-900">Total Fee (Collateral Required)</span>
                  <span className="text-base md:text-lg font-bold text-[#3375BB]">{calculatedTotalFee} ETH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 md:p-3">
            <p className="text-[10px] md:text-xs text-yellow-800">
              ⚠️ This transaction will be processed on-chain. Please ensure you have sufficient ETH for gas fees.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 md:px-6 pb-4 md:pb-6 flex gap-2 md:gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 md:py-3 rounded-xl transition-colors text-sm md:text-base"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-[#3375BB] to-blue-600 hover:shadow-lg text-white font-bold py-2.5 md:py-3 rounded-xl transition-all text-sm md:text-base"
          >
            Confirm in Wallet
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}} />
    </div>
  );
};

export default LoanConfirmModal;
