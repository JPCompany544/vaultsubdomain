import { useEffect } from 'react';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { BrowserProvider, ethers } from 'ethers'; // Ensure ethers is correctly imported

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: '2aa83b249e7e4285a3f6e69fb5271173',
    },
  },
};

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
    theme: 'dark',
    disableInjectedProvider: false,
  });
}

export default function ConnectWallet({ account, setAccount, setIsConnected, isInteractive = true }) {
  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      const browserProvider = new BrowserProvider(instance);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setIsConnected(true);

      instance.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      instance.on('chainChanged', () => {
        window.location.reload();
      });
    } catch (err) {
      console.error('Connection error:', err);
    }
  };

  const disconnectWallet = async () => {
    await web3Modal.clearCachedProvider();
    setAccount('');
    setIsConnected(false);
  };

  const handleLoanRequest = async () => {
    try {
      if (!window.ethereum) return alert('No wallet connected');

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: '0xYourReceiverAddressHere', // 🔁 Replace this with your wallet address
        value: ethers.parseEther('0.0198'), // ~$50 at current ETH price
      });

      console.log('Transaction sent:', tx.hash);
      alert('Transaction sent! Please approve in your wallet.');
    } catch (err) {
      console.error('Transaction failed:', err);
      alert('Transaction failed or was rejected.');
    }
  };

  useEffect(() => {
    if (web3Modal?.cachedProvider && !account) {
      connectWallet();
    }
  }, []);

  // --- UI Render ---
  if (!account && !isInteractive) {
    return <button className="connect-wallet-button" disabled>Connect Wallet</button>;
  }

  if (!account && isInteractive) {
    return (
      <button onClick={connectWallet} className="connect-wallet-button">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className={`wallet-info ${!isInteractive ? 'wallet-preview' : ''}`}>
      <p>
        Connected: <strong>{account.slice(0, 6)}...{account.slice(-4)}</strong>
      </p>
      {isInteractive && (
        <button onClick={disconnectWallet} className="disconnect-button">
          Disconnect
        </button>
      )}
    </div>
  );
}

// Export handleLoanRequest so you can use it from App.js or anywhere else
export async function handleLoanRequest() {
  try {
    if (!window.ethereum) return alert("Wallet not found");

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const from = accounts[0];
    const to = "0xF75EA7A13807160f8acA844bc004A6e3be340a28"; // ✅ your EOA address

    const txParams = {
      from,
      to,
      value: ethers.toBeHex(ethers.parseEther("0.00593")), // ~ $50 in ETH
    };

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [txParams],
    });

    console.log("Transaction sent:", txHash);
    alert("Transaction submitted! Please check your wallet.");
  } catch (err) {
    console.error("Transaction failed:", err);
    alert("Transaction failed or was rejected.");
  }
}

