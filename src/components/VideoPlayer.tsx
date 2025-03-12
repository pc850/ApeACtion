
import { useState, useRef, useEffect } from 'react';
import { Video } from '@/context/VideoContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  PlayIcon, 
  PauseIcon, 
  VolumeIcon, 
  Volume2Icon,
  HeartIcon,
  ShareIcon
} from 'lucide-react';

interface VideoPlayerProps {
  video: Video;
  onBack?: () => void;
}

const VideoPlayer = ({ video, onBack }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      setProgress((videoElement.currentTime / videoElement.duration) * 100);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    
    // Try to autoplay
    videoElement.play().catch(err => console.log('Autoplay prevented:', err));
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [video]);
  
  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    // Set video time
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };
  
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full rounded-lg overflow-hidden bg-black",
        isFullscreen ? "fixed inset-0 z-50" : "max-h-[70vh]"
      )}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="w-full h-full object-contain"
        playsInline
        onClick={togglePlay}
      />
      
      {/* Video overlay for controls */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={onBack}
            >
              Back
            </Button>
          )}
          
          <div className="text-white">
            <h3 className="font-medium">{video.title}</h3>
            <p className="text-sm opacity-80">{video.creator}</p>
          </div>
        </div>
        
        {/* Center play/pause button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg hover:bg-white/30"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <PauseIcon className="w-8 h-8 text-white" />
            ) : (
              <PlayIcon className="w-8 h-8 text-white" />
            )}
          </Button>
        </div>
        
        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div 
            className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <PauseIcon className="w-5 h-5" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeIcon className="w-5 h-5" />
                ) : (
                  <Volume2Icon className="w-5 h-5" />
                )}
              </Button>
              
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <HeartIcon className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
              >
                <ShareIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
