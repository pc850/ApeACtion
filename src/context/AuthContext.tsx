
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TonConnectUI, UserRejectsError, Wallet } from '@tonconnect/ui';
import { toast } from "@/components/ui/use-toast";
import { Session } from '@supabase/supabase-js';

// Initialize TonConnect with proper configuration
const tonConnectUI = new TonConnectUI({
  manifestUrl: 'https://raw.githubusercontent.com/ton-community/ton-connect-manifest/main/tonconnect-manifest.json' as `https://${string}`,
  actionsConfiguration: {
    twaReturnUrl: window.location.origin,
  },
});

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  walletAddress: string | null;
  isWalletConnected: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

    // Check if wallet is already connected
    const initWallet = async () => {
      const wallets = await tonConnectUI.getWallets();
      if (wallets.length > 0) {
        console.log("Wallet already connected:", wallets[0]);
        // Access wallet address correctly based on the Wallet type structure
        if ((wallets[0] as Wallet).account?.address) {
          setWalletAddress((wallets[0] as Wallet).account.address);
        }
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
      if (wallet) {
        setWalletAddress(wallet.account.address);
        // If wallet is connected but no session exists, create one
        if (!session) {
          try {
            await signInWithTON(wallet.account.address);
          } catch (error) {
            console.error("Error signing in with TON:", error);
          }
        }
      } else {
        setWalletAddress(null);
        // If wallet disconnected, sign out
        if (session) {
          await supabase.auth.signOut();
        }
      }
    });

    initSession();
    initWallet();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  // Sign in with TON wallet
  const signInWithTON = async (address: string) => {
    try {
      console.log("Signing in with address:", address);
      // Use a custom token from Supabase to authenticate with the TON address
      // In a real implementation, you'd want to verify ownership of the address
      const { error } = await supabase.auth.signInWithPassword({
        email: `${address}@ton.wallet`, // Using a deterministic email
        password: address, // Using the address as password (this is simplified)
      });
      
      if (error) {
        console.log("Sign in error:", error.message);
        // If user doesn't exist, create a new account
        if (error.message.includes("Invalid login credentials")) {
          console.log("Creating new user");
          const { error: signUpError } = await supabase.auth.signUp({
            email: `${address}@ton.wallet`,
            password: address,
          });
          
          if (signUpError) {
            throw signUpError;
          } else {
            // Try to sign in again after signup
            await supabase.auth.signInWithPassword({
              email: `${address}@ton.wallet`,
              password: address,
            });
          }
        } else {
          throw error;
        }
      }
      
      toast({
        title: "Wallet Connected",
        description: "Successfully connected your TON wallet",
      });
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate with TON wallet",
        variant: "destructive",
      });
      throw error;
    }
  };

  const connectWallet = async () => {
    try {
      console.log("Attempting to connect wallet...");
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
    }
  };

  const disconnectWallet = async () => {
    try {
      tonConnectUI.disconnect();
      await supabase.auth.signOut();
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
        isWalletConnected: !!walletAddress,
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
