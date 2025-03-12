
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletIcon } from 'lucide-react';
import { TokenProvider } from '@/context/TokenContext';
import TokenCounter from '@/components/TokenCounter';

const Auth = () => {
  const { connectWallet, isWalletConnected, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already connected, redirect to home
    if (isWalletConnected && !isLoading) {
      navigate('/');
    }
    
    // Set page title
    document.title = 'Sign In | ClickNEarn';
    
    // Log for debugging
    console.log('Auth page - isWalletConnected:', isWalletConnected, 'isLoading:', isLoading);
  }, [isWalletConnected, navigate, isLoading]);

  const handleConnectWallet = async () => {
    console.log('Connect wallet button clicked');
    await connectWallet();
  };

  return (
    <TokenProvider>
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to ClickNEarn</CardTitle>
            <CardDescription>
              Connect your TON wallet to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <WalletIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex justify-center mb-6">
              <TokenCounter />
            </div>
            <p className="text-center mb-6">
              Authentication using TON wallet provides a secure way to access your account without passwords.
            </p>
            <Button 
              onClick={handleConnectWallet} 
              disabled={isLoading} 
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Connecting...' : 'Connect TON Wallet'}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center text-center text-sm text-muted-foreground">
            <p>
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </TokenProvider>
  );
};

export default Auth;
