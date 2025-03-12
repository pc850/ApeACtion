
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

interface TokenContextType {
  tokens: number;
  addTokens: (amount: number) => void;
  spendTokens: (amount: number) => boolean;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const [tokens, setTokens] = useState<number>(0);

  // Load tokens from localStorage on initial render
  useEffect(() => {
    const storedTokens = localStorage.getItem('tokens');
    if (storedTokens) {
      setTokens(parseInt(storedTokens, 10));
    }
  }, []);

  // Save tokens to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tokens', tokens.toString());
  }, [tokens]);

  const addTokens = (amount: number) => {
    if (amount <= 0) return;
    
    setTokens(prev => {
      const newTotal = prev + amount;
      
      // Show a toast for token earned
      toast({
        title: `+${amount} Tokens Earned!`,
        description: `You now have ${newTotal} tokens total.`,
        duration: 2000,
      });
      
      return newTotal;
    });
  };

  const spendTokens = (amount: number): boolean => {
    if (amount <= 0) return false;
    
    if (tokens >= amount) {
      setTokens(prev => {
        const newTotal = prev - amount;
        
        // Show a toast for tokens spent
        toast({
          title: `-${amount} Tokens Spent`,
          description: `You have ${newTotal} tokens remaining.`,
          duration: 2000,
        });
        
        return newTotal;
      });
      return true;
    } else {
      toast({
        title: "Not Enough Tokens",
        description: `You need ${amount} tokens, but only have ${tokens}.`,
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
  };

  return (
    <TokenContext.Provider value={{ tokens, addTokens, spendTokens }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = (): TokenContextType => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
};
