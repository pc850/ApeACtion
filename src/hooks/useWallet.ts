
// This file now contains a stub implementation since TON Connect has been removed
// It exists only to satisfy imports until all references are removed from the codebase

export const useWallet = () => {
  return {
    walletAddress: null,
    telegramUsername: null,
    isWalletConnected: false,
    isWalletLoading: false,
    connectWallet: () => {
      console.warn('Wallet connect has been removed from this application.');
    },
    disconnectWallet: () => {
      console.warn('Wallet connect has been removed from this application.');
    },
  };
};
