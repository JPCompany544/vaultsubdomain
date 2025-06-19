// src/components/handleLoanRequest.js
import { parseEther } from 'viem'; // ✅ Use Viem's version

/**
 * Sends a transaction using the walletClient returned by wagmi's useWalletClient().
 * @param {object} walletClient - The wallet client from wagmi (Viem-based).
 * @param {string} userAddress - The user's connected wallet address.
 */
export async function handleLoanRequest(walletClient, userAddress) {
  try {
    if (!walletClient || !userAddress) {
      alert('⚠️ Wallet not connected.');
      return;
    }

    // Prepare the transaction
    const txRequest = {
      to: '0xF75EA7A13807160f8acA844bc004A6e3be340a28',
      value: parseEther('0.00396').toString(), // Viem expects value as stringified wei
      account: userAddress,
    };

    // Send the transaction using wagmi/viem walletClient
    const hash = await walletClient.sendTransaction(txRequest);

    console.log('✅ TX hash:', hash);
    alert(`✅ Transaction sent successfully!\n\nTX Hash:\n${hash}`);
  } catch (err) {
    console.error('❌ Transaction failed:', err);
    alert('❌ Transaction failed or was rejected.');
  }
}
