// src/components/handleLoanRequest.ts
import { parseEther } from 'viem';

export interface LoanFeeBreakdown {
  networkFee: number;
  processingFee: number;
  platformFee: number;
  totalFee: number;
}

/**
 * Calculate loan fees based on loan amount
 */
export function calculateLoanFees(loanAmount: number): LoanFeeBreakdown {
  let networkFee: number;
  let processingFee: number;
  let platformFee: number;
  let totalFee: number;

  switch (loanAmount) {
    case 500:
      networkFee = 0.005;
      processingFee = 0.003;
      platformFee = 0.002;
      totalFee = 0.01;
      break;
    case 1000:
      networkFee = 0.008;
      processingFee = 0.005;
      platformFee = 0.002;
      totalFee = 0.015;
      break;
    case 2500:
      networkFee = 0.012;
      processingFee = 0.006;
      platformFee = 0.002;
      totalFee = 0.02;
      break;
    case 5000:
      networkFee = 0.015;
      processingFee = 0.008;
      platformFee = 0.002;
      totalFee = 0.025;
      break;
    case 10000:
      networkFee = 0.025;
      processingFee = 0.01;
      platformFee = 0.005;
      totalFee = 0.04;
      break;
    default:
      networkFee = 0.0252;
      processingFee = 0.01;
      platformFee = 0.005;
      totalFee = 0.0402;
  }

  return { networkFee, processingFee, platformFee, totalFee };
}

/**
 * Execute the loan transaction
 * @param walletClient - The Viem-based wallet client from wagmi.
 * @param userAddress - The connected wallet address.
 * @param loanAmount - The requested loan amount in USD.
 * @param onSuccess - Callback for successful transaction
 * @param onError - Callback for transaction error
 */
export async function executeLoanTransaction(
  walletClient: any,
  userAddress: string,
  loanAmount: number,
  onSuccess?: (txHash: string) => void,
  onError?: (error: string) => void
): Promise<void> {
  try {
    if (!walletClient || !userAddress) {
      onError?.('Wallet not connected.');
      return;
    }

    const { totalFee } = calculateLoanFees(loanAmount);

    const tx = {
      to: '0xADD003E62A930d6D950453080B82156D7Cfe1f4A',
      value: parseEther(totalFee.toString()),
      account: userAddress
    };

    const txHash = await walletClient.sendTransaction(tx);

    console.log('✅ Transaction Hash:', txHash);
    onSuccess?.(txHash);
  } catch (err: any) {
    console.error('❌ Transaction Error:', err);
    onError?.(err?.message || 'Unknown error');
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use executeLoanTransaction with modal instead
 */
export async function handleLoanRequest(
  walletClient: any,
  userAddress: string,
  loanAmount: number
): Promise<void> {
  await executeLoanTransaction(
    walletClient,
    userAddress,
    loanAmount,
    (txHash) => {
      console.log('Transaction successful:', txHash);
    },
    (error) => {
      console.error('Transaction failed:', error);
    }
  );
}
