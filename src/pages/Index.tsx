
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import TokenCounter from '@/components/TokenCounter';
import { useTokens } from '@/context/TokenContext';
import { motion } from 'framer-motion';
import { 
  CoinIcon, 
  VideoIcon, 
  ArrowRightIcon, 
  UserIcon 
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { tokens } = useTokens();
  
  return (
    <div className="min-h-[calc(100vh-64px)] p-4 md:p-6 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 page-transition">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Welcome to <span className="text-primary">ClickNEarn</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Earn tokens by clicking and watching videos, then spend them to interact with creators.
        </p>
        
        {/* Token Display */}
        <div className="mt-6 flex justify-center">
          <TokenCounter />
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
        {/* Earn Feature */}
        <motion.div 
          className="glass-panel rounded-xl p-6 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CoinIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Click to Earn</h2>
          <p className="text-muted-foreground mb-4">
            Earn tokens by clicking on our interactive character.
          </p>
          <Button 
            onClick={() => navigate('/earn')}
            className="mt-auto group"
          >
            Start Earning
            <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
        
        {/* Feed Feature */}
        <motion.div 
          className="glass-panel rounded-xl p-6 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <VideoIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Video Feed</h2>
          <p className="text-muted-foreground mb-4">
            Browse videos and earn tokens by watching ads.
          </p>
          <Button 
            onClick={() => navigate('/feed')}
            className="mt-auto group"
          >
            Browse Videos
            <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
        
        {/* Profile Feature */}
        <motion.div 
          className="glass-panel rounded-xl p-6 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <UserIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
          <p className="text-muted-foreground mb-4">
            View your tokens and manage your account.
          </p>
          <Button 
            onClick={() => navigate('/profile')}
            className="mt-auto group"
          >
            View Profile
            <ArrowRightIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
      
      {/* Current Balance */}
      <div className="mt-12 text-center">
        <p className="text-lg mb-2">Your current balance:</p>
        <div className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <CoinIcon className="w-6 h-6" />
          {tokens} Tokens
        </div>
      </div>
    </div>
  );
};

export default Index;
