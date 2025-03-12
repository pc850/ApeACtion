
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Session } from '@supabase/supabase-js';
import { useWallet } from '@/hooks/useWallet';
import { tonConnectUI, getWalletAddress, getTelegramUsername } from '@/utils/tonConnectUtils';
import { signInWithTON, signOut } from '@/services/authService';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  walletAddress: string | null;
  isWalletConnected: boolean;
  telegramUsername: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);
  const { 
    walletAddress, 
    isWalletConnected, 
    connectWallet: connectWalletBase, 
    disconnectWallet: disconnectWalletBase
  } = useWallet();

  useEffect(() => {
    // Initialize session from Supabase
    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    // Listen for wallet connection changes
    tonConnectUI.onStatusChange(async (wallet) => {
      console.log("Wallet status changed:", wallet);
      const address = getWalletAddress(wallet);
      const username = getTelegramUsername(wallet);
      
      if (username) {
        setTelegramUsername(username);
      }
      
      if (address) {
        // If wallet is connected but no session exists, create one
        if (!session) {
          try {
            await signInWithTON(address, username);
          } catch (error) {
            console.error("Error signing in with TON:", error);
          }
        }
      } else {
        // If wallet disconnected, sign out
        if (session) {
          await signOut();
        }
      }
    });

    initSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  const connectWallet = async () => {
    try {
      await connectWalletBase();
    } catch (error) {
      console.error("Error in connectWallet:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnectWalletBase();
      await signOut();
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
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        connectWallet,
        disconnectWallet,
        walletAddress,
        isWalletConnected,
        telegramUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
