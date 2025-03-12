
import { useTokens } from '@/context/TokenContext';
import { cn } from '@/lib/utils';
import { CoinsIcon } from 'lucide-react';

interface TokenCounterProps {
  className?: string;
  variant?: 'default' | 'transparent';
}

const TokenCounter = ({ className, variant = 'default' }: TokenCounterProps) => {
  const { tokens } = useTokens();
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full transition-all",
        variant === 'default' 
          ? "bg-white/10 backdrop-blur-lg border border-white/20 shadow-md" 
          : "bg-transparent",
        className
      )}
    >
      <CoinsIcon className="w-5 h-5 text-yellow-400 animate-pulse-soft" />
      <span className={cn(
        "font-semibold",
        variant === 'default' ? "text-white" : "text-primary"
      )}>
        {tokens} Tokens
      </span>
    </div>
  );
};

export default TokenCounter;
