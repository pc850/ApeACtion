
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TokenProvider } from '@/context/TokenContext';
import TokenCounter from '@/components/TokenCounter';

const Auth = () => {
  const { isLoading, session } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (session) {
      navigate('/');
    }
    
    // Set page title
    document.title = 'Sign In | ClickNEarn';
    
    // Log for debugging
    console.log('Auth page - Auth state:', { 
      isLoading, 
      hasSession: !!session 
    });
  }, [navigate, isLoading, session]);

  return (
    <TokenProvider>
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to ClickNEarn</CardTitle>
            <CardDescription>
              Authentication feature has been removed
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="flex justify-center mb-6">
              <TokenCounter />
            </div>
            <div className="text-center mb-6 space-y-2">
              <p>
                The wallet connect feature has been removed from this application.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-center text-sm text-muted-foreground">
            <p>
              Please contact the administrator for more information.
            </p>
          </CardFooter>
        </Card>
      </div>
    </TokenProvider>
  );
};

export default Auth;
