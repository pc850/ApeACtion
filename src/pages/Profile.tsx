
import { useState, useEffect } from 'react';
import { useTokens } from '@/context/TokenContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CoinsIcon, UserIcon, HistoryIcon, SettingsIcon, MessageCircleIcon } from 'lucide-react';

const Profile = () => {
  const { tokens } = useTokens();
  const { walletAddress, telegramUsername } = useAuth();
  const [joinDate] = useState(new Date());
  
  // Mock data for token history
  const tokenHistory = [
    { id: 1, date: new Date(Date.now() - 86400000), amount: 5, source: 'Click to Earn' },
    { id: 2, date: new Date(Date.now() - 86400000 * 2), amount: 10, source: 'Ad Reward' },
    { id: 3, date: new Date(Date.now() - 86400000 * 3), amount: -15, source: 'Chat with Creator' },
    { id: 4, date: new Date(Date.now() - 86400000 * 4), amount: 8, source: 'Ad Reward' },
    { id: 5, date: new Date(Date.now() - 86400000 * 5), amount: 3, source: 'Click to Earn' },
  ];
  
  useEffect(() => {
    // Set page title
    document.title = 'Profile | ClickNEarn';
  }, []);
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format wallet address
  const formatWalletAddress = (address: string | null) => {
    if (!address) return 'Not connected';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="container mx-auto p-4 page-transition">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* User Card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserIcon className="w-12 h-12 text-primary" />
              </div>
              
              {telegramUsername ? (
                <div className="flex items-center mb-2">
                  <MessageCircleIcon className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-lg font-medium">@{telegramUsername}</span>
                </div>
              ) : null}
              
              <div className="mb-4 text-center">
                <h2 className="text-xl font-semibold">Wallet</h2>
                <p className="text-sm text-muted-foreground font-mono">
                  {formatWalletAddress(walletAddress)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Joined: {formatDate(joinDate)}
                </p>
              </div>
              
              <Button variant="outline" className="w-full">
                <SettingsIcon className="mr-2 w-4 h-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          
          {/* Token Stats */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Token Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CoinsIcon className="w-6 h-6 text-yellow-400" />
                  <span className="text-3xl font-bold">{tokens}</span>
                </div>
                <Button variant="outline">
                  <HistoryIcon className="mr-2 w-4 h-4" />
                  View History
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Lifetime earnings</span>
                    <span className="text-sm font-medium">230 tokens</span>
                  </div>
                  <Progress value={tokens > 0 ? (tokens / 230) * 100 : 0} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Next reward tier</span>
                    <span className="text-sm font-medium">50 more tokens</span>
                  </div>
                  <Progress value={tokens > 0 ? (tokens / (tokens + 50)) * 100 : 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Token Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tokenHistory.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.source}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                    <div className={`font-semibold ${item.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.amount > 0 ? `+${item.amount}` : item.amount} tokens
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
