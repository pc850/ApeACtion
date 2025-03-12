
import { useState, useEffect, useCallback } from 'react';
import { UserRejectsError } from '@tonconnect/ui';
import { toast } from "@/components/ui/use-toast";
import { tonConnectUI, getWalletAddress } from '@/utils/tonConnectUtils';

export const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  useEffect(() => {
    // Check if wallet is already connected
    const initWallet = async () => {
      try {
        const wallets = await tonConnectUI.getWallets();
        if (wallets.length > 0) {
          console.log("Wallet already connected:", wallets[0]);
          const address = getWalletAddress(wallets[0]);
          if (address) {
            setWalletAddress(address);
          }
        }
      } catch (error) {
        console.error("Error initializing wallet:", error);
      } finally {
        setIsWalletLoading(false);
      }
    };

    initWallet();
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      console.log("Attempting to connect wallet...");
      setIsWalletLoading(true);
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
    isWalletConnected: !!walletAddress,
    isWalletLoading,
    connectWallet,
    disconnectWallet,
  };
};
