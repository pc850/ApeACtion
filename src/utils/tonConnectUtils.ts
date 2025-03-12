
import { TonConnectUI } from '@tonconnect/ui';

// Initialize TonConnect with proper configuration
export const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://raw.githubusercontent.com/ton-community/ton-connect-manifest/main/tonconnect-manifest.json' as `https://${string}`,
  actionsConfiguration: {
    twaReturnUrl: window.location.origin,
  },
});

export const getWalletAddress = (wallet: any): string | null => {
  if (wallet && 'account' in wallet && wallet.account?.address) {
    return wallet.account.address;
  }
  return null;
};
