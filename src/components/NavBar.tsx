import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import TokenCounter from './TokenCounter';
import { 
  HomeIcon, 
  CoinsIcon, 
  VideoIcon, 
  UserIcon, 
  MenuIcon,
  XIcon
} from 'lucide-react';

const NavBar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/earn', label: 'Earn', icon: CoinsIcon },
    { path: '/feed', label: 'Feed', icon: VideoIcon },
    { path: '/profile', label: 'Profile', icon: UserIcon },
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-background/80 backdrop-blur-lg shadow-md" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="text-xl font-bold text-primary tracking-tight flex items-center"
          >
            <span>ClickNEarn</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 py-1 px-3 rounded-full transition-all duration-300",
                  location.pathname === item.path 
                    ? "text-primary font-medium bg-primary/10" 
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <TokenCounter className="hidden md:flex" />
          
          <button 
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-md transition-all duration-200",
                    location.pathname === item.path 
                      ? "text-primary font-medium bg-primary/10" 
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-3 pt-3 border-t border-border">
              <TokenCounter variant="transparent" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
