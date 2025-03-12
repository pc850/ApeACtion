
import { TonConnectUI } from '@tonconnect/ui';

// Initialize TonConnect with proper configuration
export const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://kkddzgpenchcqjxyehep.supabase.co/storage/v1/object/public/ton/tonconnect-manifest.json',
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
