// src/components/handleLoanRequest.js
import { parseEther } from 'viem';

/**
 * Sends a transaction using the walletClient returned by wagmi's useWalletClient().
 * @param {object} walletClient - The Viem-based wallet client from wagmi.
 * @param {string} userAddress - The connected wallet address.
 * @param {number} loanAmount - The requested loan amount in USD.
 */
export async function handleLoanRequest(walletClient, userAddress, loanAmount) {
  try {
    if (!walletClient || !userAddress) {
      alert('⚠️ Wallet not connected.');
      return;
    }

    // Calculate different fees based on loan amount
    let networkFee;
    let processingFee;
    let totalFee;

    switch (loanAmount) {
      case 5000:
        networkFee = 0.015; // 0.015 ETH
        processingFee = 0.005;
        totalFee = 0.02;
        break;
      case 10000:
        networkFee = 0.025; // 0.025 ETH
        processingFee = 0.01;
        totalFee = 0.035;
        break;
      case 15000:
        networkFee = 0.035; // 0.035 ETH
        processingFee = 0.015;
        totalFee = 0.05;
        break;
      case 20000:
        networkFee = 0.045; // 0.045 ETH
        processingFee = 0.02;
        totalFee = 0.065;
        break;
      case 50000:
        networkFee = 0.055; // 0.055 ETH
        processingFee = 0.025;
        totalFee = 0.08;
        break;
      case 100000:
        networkFee = 0.065; // 0.065 ETH
        processingFee = 0.03;
        totalFee = 0.095;
        break;
      default:
        networkFee = 0.0252;
        processingFee = 0.01;
        totalFee = 0.0352;
    }

    // Show confirmation dialog with loan details
    const confirmMessage = `💰 Loan Request: $${loanAmount.toLocaleString()}\n\n` +
      `📊 Fee Breakdown:\n` +
      `• Network Fee: ${networkFee} ETH\n` +
      `• Processing Fee: ${processingFee} ETH\n` +
      `• Total Fee: ${totalFee} ETH\n\n` +
      `Do you want to proceed with this loan request?`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      alert('❌ Loan request cancelled.');
      return;
    }

    const tx = {
      to: '0x53Aa12649B1f6F6f069c860c8FbB53D507f50b72', // replace with your real address
      value: parseEther(totalFee.toString()), // Use calculated total fee
      account: userAddress
    };

    const txHash = await walletClient.sendTransaction(tx);

    console.log('✅ Transaction Hash:', txHash);
    alert(`✅ Loan request submitted!\n\n💰 Amount: $${loanAmount.toLocaleString()}\n💸 Total Fee: ${totalFee} ETH\n📋 TX Hash:\n${txHash}`);
  } catch (err) {
    console.error('❌ Transaction Error:', err);
    alert(`❌ Transaction failed: ${err?.message || 'Unknown error'}`);
  }
}
