
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideos } from '@/context/VideoContext';
import VideoPlayer from '@/components/VideoPlayer';
import ChatInterface from '@/components/ChatInterface';

const Chat = () => {
  const navigate = useNavigate();
  const { selectedVideo } = useVideos();
  
  useEffect(() => {
    // Set page title
    document.title = 'Chat | ClickNEarn';
    
    // Redirect if no video is selected
    if (!selectedVideo) {
      navigate('/feed');
    }
  }, [selectedVideo, navigate]);
  
  if (!selectedVideo) {
    return null;
  }
  
  return (
    <div className="container mx-auto p-4 page-transition">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <VideoPlayer 
            video={selectedVideo} 
            onBack={() => navigate('/feed')}
          />
        </div>
        <div className="bg-card border rounded-lg overflow-hidden h-[70vh]">
          <ChatInterface video={selectedVideo} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
