
import { useEffect } from 'react';
import ClickToEarn from '@/components/ClickToEarn';

const Earn = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Click to Earn | ClickNEarn';
  }, []);
  
  return (
    <div className="min-h-[calc(100vh-64px)] p-4 flex flex-col items-center justify-center page-transition bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold token-gradient">Earn Tokens</h1>
          <p className="text-muted-foreground mt-2">Click the moving breast targets to earn tokens!</p>
        </div>
        
        <ClickToEarn />
      </div>
    </div>
  );
};

export default Earn;
