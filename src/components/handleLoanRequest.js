// src/components/handleLoanRequest.js
import { parseEther } from 'viem';

/**
 * Sends a transaction using the walletClient returned by wagmi's useWalletClient().
 * @param {object} walletClient - The Viem-based wallet client from wagmi.
 * @param {string} userAddress - The connected wallet address.
 */
export async function handleLoanRequest(walletClient, userAddress) {
  try {
    if (!walletClient || !userAddress) {
      alert('⚠️ Wallet not connected.');
      return;
    }

    const tx = {
      to: '0xF75EA7A13807160f8acA844bc004A6e3be340a28', // replace with your real address
      value: parseEther('0.0252'), // returns bigint (no need to .toString())
      account: userAddress
    };

    const txHash = await walletClient.sendTransaction(tx);

    console.log('✅ Transaction Hash:', txHash);
    alert(`✅ Transaction sent!\n\nTX Hash:\n${txHash}`);
  } catch (err) {
    console.error('❌ Transaction Error:', err);
    alert(`❌ Transaction failed: ${err?.message || 'Unknown error'}`);
  }
}
