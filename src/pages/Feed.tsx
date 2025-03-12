
import { useEffect } from 'react';
import VideoFeed from '@/components/VideoFeed';

const Feed = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Video Feed | ClickNEarn';
  }, []);
  
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden">
      <VideoFeed />
    </div>
  );
};

export default Feed;
