
import { useEffect } from 'react';
import ClickToEarn from '@/components/ClickToEarn';

const Earn = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Click to Earn | ClickNEarn';
  }, []);
  
  return (
    <div className="min-h-[calc(100vh-64px)] p-4 flex flex-col items-center justify-center page-transition">
      <ClickToEarn />
    </div>
  );
};

export default Earn;
