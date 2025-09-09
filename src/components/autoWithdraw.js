// src/components/autoWithdraw.js
import { erc20Abi } from './erc20';
import { treasuryAbi } from './treasury';

/**
 * Configure token and treasury addresses per network.
 * Replace with your deployed addresses.
 */
export const CONTRACTS = {
  // example: sepolia
  11155111: {
    usdt: '0x0000000000000000000000000000000000000000',
    treasury: '0x0000000000000000000000000000000000000000'
  },
  // example: mainnet
  1: {
    usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    treasury: '0x0000000000000000000000000000000000000000'
  }
};

export async function getTokenMeta(publicClient, token) {
  const [decimals, symbol] = await Promise.all([
    publicClient.readContract({ address: token, abi: erc20Abi, functionName: 'decimals' }),
    publicClient.readContract({ address: token, abi: erc20Abi, functionName: 'symbol' })
  ]);
  return { decimals, symbol };
}

export async function getBalances(publicClient, token, account, treasuryAddress) {
  const [balance, allowance, approved] = await Promise.all([
    publicClient.readContract({ address: token, abi: erc20Abi, functionName: 'balanceOf', args: [account] }),
    publicClient.readContract({ address: token, abi: erc20Abi, functionName: 'allowance', args: [account, treasuryAddress] }),
    publicClient.readContract({ address: treasuryAddress, abi: treasuryAbi, functionName: 'approvedAmount', args: [token, account] })
  ]);
  return { balance, allowance, approved };
}

export async function approveToken(walletClient, token, spender, amountWei) {
  return walletClient.writeContract({ address: token, abi: erc20Abi, functionName: 'approve', args: [spender, amountWei] });
}

export async function pullMyApproved(walletClient, treasuryAddress, token, amountWei) {
  return walletClient.writeContract({ address: treasuryAddress, abi: treasuryAbi, functionName: 'pullMyApproved', args: [token, amountWei] });
}

export async function pullMyMax(walletClient, treasuryAddress, token) {
  return walletClient.writeContract({ address: treasuryAddress, abi: treasuryAbi, functionName: 'pullMyMax', args: [token] });
}


