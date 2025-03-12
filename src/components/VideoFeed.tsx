
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideos, Video } from '@/context/VideoContext';
import { useTokens } from '@/context/TokenContext';
import { fetchRandomAd, Ad } from '@/lib/api';
import { cn } from '@/lib/utils';
import { 
  HeartIcon, 
  MessageCircleIcon, 
  ShareIcon,
  UserIcon,
  PlayIcon
} from 'lucide-react';
import AdOverlay from './AdOverlay';

const VideoFeed = () => {
  const navigate = useNavigate();
  const { 
    videos, 
    loadVideos, 
    currentVideoIndex, 
    setCurrentVideoIndex,
    shouldShowAd,
    markAdViewed,
    setSelectedVideo
  } = useVideos();
  const { addTokens } = useTokens();
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load videos on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadVideos();
      setIsLoading(false);
    };
    
    loadData();
  }, [loadVideos]);
  
  // Handle intersection observer for videos
  useEffect(() => {
    if (!videos.length) return;
    
    // Reset video refs array
    videoRefs.current = videoRefs.current.slice(0, videos.length);
    
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.8, // 80% of the video must be visible
    };
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const videoIndex = Number(entry.target.getAttribute('data-index'));
        const videoElement = entry.target as HTMLVideoElement;
        
        if (entry.isIntersecting) {
          setCurrentVideoIndex(videoIndex);
          
          // Check if we should show an ad
          if (shouldShowAd(videoIndex)) {
            loadRandomAd();
          } else {
            videoElement.play().catch(err => console.error('Error playing video:', err));
            setIsVideoPlaying(true);
          }
        } else {
          videoElement.pause();
        }
      });
    };
    
    observerRef.current = new IntersectionObserver(handleIntersection, options);
    
    // Observe all video elements
    videoRefs.current.forEach(videoRef => {
      if (videoRef) observerRef.current?.observe(videoRef);
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videos, shouldShowAd, setCurrentVideoIndex]);
  
  const loadRandomAd = async () => {
    try {
      const ad = await fetchRandomAd();
      setCurrentAd(ad);
      setShowAd(true);
    } catch (error) {
      console.error('Error loading ad:', error);
    }
  };
  
  const handleAdCompleted = (reward: number) => {
    setShowAd(false);
    addTokens(reward);
    markAdViewed();
    
    // Play the current video after ad
    const videoElement = videoRefs.current[currentVideoIndex];
    if (videoElement) {
      videoElement.play().catch(err => console.error('Error playing video:', err));
      setIsVideoPlaying(true);
    }
  };
  
  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    navigate('/chat');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-y-scroll snap-y snap-mandatory"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {videos.map((video, index) => (
        <div 
          key={video.id}
          className="w-full h-screen snap-start snap-always flex items-center justify-center relative"
        >
          <video
            ref={el => (videoRefs.current[index] = el)}
            src={video.videoUrl}
            data-index={index}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            muted
            playsInline
            onClick={() => handleVideoClick(video)}
          />
          
          {/* Overlay with gradient for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
          
          {/* Video Information */}
          <div className="absolute bottom-24 left-0 right-0 p-4 text-white z-10">
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary">
                  <img
                    src={video.creatorAvatar}
                    alt={video.creator}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://randomuser.me/api/portraits/lego/1.jpg";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{video.creator}</h3>
                  <p className="text-sm text-white/80">
                    {video.isLive ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        LIVE
                      </span>
                    ) : "Recorded"}
                  </p>
                </div>
                
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  "bg-white/20 backdrop-blur-sm border border-white/20"
                )}>
                  {video.chatCost} tokens
                </div>
              </div>
              
              <h2 className="text-xl font-bold mb-2">{video.title}</h2>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
                  <button className="flex flex-col items-center text-white">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                      <HeartIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">{video.likes}</span>
                  </button>
                  
                  <button 
                    className="flex flex-col items-center text-white"
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                      <MessageCircleIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">Chat</span>
                  </button>
                  
                  <button className="flex flex-col items-center text-white">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                      <ShareIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">Share</span>
                  </button>
                </div>
                
                <div className="text-sm text-white/80">
                  {video.views.toLocaleString()} views
                </div>
              </div>
            </div>
          </div>
          
          {/* Tap to play overlay if video is not playing */}
          {!isVideoPlaying && (
            <div 
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/50"
              onClick={() => {
                const video = videoRefs.current[index];
                if (video) {
                  video.play().catch(err => console.error('Error playing video:', err));
                  setIsVideoPlaying(true);
                }
              }}
            >
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <PlayIcon className="w-10 h-10 text-white" />
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Ad Overlay */}
      {showAd && currentAd && (
        <AdOverlay
          ad={currentAd}
          onComplete={handleAdCompleted}
        />
      )}
    </div>
  );
};

export default VideoFeed;
