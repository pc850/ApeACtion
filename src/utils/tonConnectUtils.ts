
// This file now contains a stub implementation since TON Connect has been removed
// It exists only to satisfy imports until all references are removed from the codebase

export const getManifestData = async () => {
  console.warn('TON Connect has been removed from this application.');
  return null;
};

export const tonConnectUI = {
  connectWallet: () => {
    console.warn('TON Connect has been removed from this application.');
    return Promise.resolve(null);
  },
  getWallets: () => {
    console.warn('TON Connect has been removed from this application.');
    return Promise.resolve([]);
  },
  disconnect: () => {
    console.warn('TON Connect has been removed from this application.');
  },
  onStatusChange: () => {
    console.warn('TON Connect has been removed from this application.');
    return { unsubscribe: () => {} };
  },
};

export const getWalletAddress = () => {
  console.warn('TON Connect has been removed from this application.');
  return null;
};

export const getTelegramInfo = () => {
  console.warn('TON Connect has been removed from this application.');
  return {};
};

export const storeWalletConnection = async () => {
  console.warn('TON Connect has been removed from this application.');
};
