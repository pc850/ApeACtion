
import { useState, useEffect, useCallback } from 'react';
import { UserRejectsError } from '@tonconnect/ui';
import { toast } from "@/components/ui/use-toast";
import { tonConnectUI, getWalletAddress, getTelegramInfo } from '@/utils/tonConnectUtils';

export const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  useEffect(() => {
    // Check if wallet is already connected
    const initWallet = async () => {
      try {
        const wallets = await tonConnectUI.getWallets();
        if (wallets.length > 0) {
          console.log("Wallet already connected:", wallets[0]);
          const address = getWalletAddress(wallets[0]);
          const telegramData = getTelegramInfo(wallets[0]);
          
          if (address) {
            setWalletAddress(address);
          }
          
          if (telegramData.username) {
            setTelegramUsername(telegramData.username);
          }
        }
      } catch (error) {
        console.error("Error initializing wallet:", error);
      } finally {
        setIsWalletLoading(false);
      }
    };

    // Listen for wallet connection status changes
    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        const address = getWalletAddress(wallet);
        const telegramData = getTelegramInfo(wallet);
        
        setWalletAddress(address);
        setTelegramUsername(telegramData.username || null);
        
        console.log("Wallet connected:", { address, telegramUsername: telegramData.username });
      } else {
        setWalletAddress(null);
        setTelegramUsername(null);
      }
    });

    initWallet();
    
    return () => {
      unsubscribe();
    };
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      console.log("Attempting to connect wallet...");
      setIsWalletLoading(true);
      
      // Show all available wallets to maximize compatibility
      const result = await tonConnectUI.connectWallet();
      console.log("Connect wallet result:", result);
    } catch (error) {
      console.error("Connect wallet error:", error);
      if (error instanceof UserRejectsError) {
        toast({
          title: "Connection Rejected",
          description: "You rejected the connection request",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Failed to connect to wallet",
          variant: "destructive",
        });
      }
    } finally {
      setIsWalletLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      tonConnectUI.disconnect();
      setWalletAddress(null);
      setTelegramUsername(null);
      toast({
        title: "Disconnected",
        description: "Successfully disconnected your wallet",
      });
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast({
        title: "Disconnection Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  }, []);

  return {
    walletAddress,
    telegramUsername,
    isWalletConnected: !!walletAddress,
    isWalletLoading,
    connectWallet,
    disconnectWallet,
  };
};
