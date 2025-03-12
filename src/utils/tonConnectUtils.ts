
import { TonConnectUI } from '@tonconnect/ui';
import { supabase } from '@/integrations/supabase/client';

// Create a function to fetch manifest data from the database
export const getManifestData = async () => {
  try {
    const { data, error } = await supabase
      .from('ton_config')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching TON manifest data:', error);
    return null;
  }
};

// Initialize TonConnect with proper configuration
export const tonConnectUI = new TonConnectUI({
  manifestUrl: `https://kkddzgpenchcqjxyehep.supabase.co/manifest.json`,
  actionsConfiguration: {
    twaReturnUrl: window.location.origin,
  },
});

// Update manifest URL after fetching data
(async () => {
  const manifestData = await getManifestData();
  if (manifestData) {
    // Create a manifest object to serve locally (in-memory)
    const manifest = {
      url: manifestData.url,
      name: manifestData.name,
      iconUrl: manifestData.icon_url,
      termsOfUseUrl: manifestData.terms_of_use_url,
      privacyPolicyUrl: manifestData.privacy_policy_url
    };

    // Convert to blob and create URL
    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestUrl = URL.createObjectURL(blob);
    
    // The TypeScript definition doesn't include updateConfig
    // But it's documented in the library, so we use a type assertion
    (tonConnectUI as any).updateConfig({
      manifestUrl
    });
    
    console.log('TON Connect manifest updated from database');
  }
})();

export const getWalletAddress = (wallet: any): string | null => {
  if (wallet && 'account' in wallet && wallet.account?.address) {
    return wallet.account.address;
  }
  return null;
};

// Extract Telegram ID and username if available
export const getTelegramInfo = (wallet: any): { id?: number; username?: string } => {
  if (wallet?.device?.platform === 'telegram') {
    return {
      id: wallet.device.appVersion,
      username: wallet.device.appName
    };
  }
  return {};
};

// Store wallet connection in database
export const storeWalletConnection = async (
  walletAddress: string,
  telegramId?: number,
  telegramUsername?: string
) => {
  try {
    const { error } = await supabase
      .from('wallet_connections')
      .upsert({
        wallet_address: walletAddress,
        telegram_id: telegramId,
        username: telegramUsername,
      }, {
        onConflict: 'wallet_address'
      });

    if (error) {
      console.error('Error storing wallet connection:', error);
    }
  } catch (error) {
    console.error('Error in storeWalletConnection:', error);
  }
};

