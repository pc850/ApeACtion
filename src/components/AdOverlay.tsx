
import { useState, useRef, useEffect } from 'react';
import { Ad } from '@/lib/api';
import { XCircleIcon, PlayIcon, PauseIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface AdOverlayProps {
  ad: Ad;
  onComplete: (reward: number) => void;
}

const AdOverlay = ({ ad, onComplete }: AdOverlayProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [adTime, setAdTime] = useState(ad.duration);
  const [canSkip, setCanSkip] = useState(false);
  const [hasEarnedReward, setHasEarnedReward] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<number | null>(null);
  
  // Start ad timer
  useEffect(() => {
    if (isPlaying && adTime > 0) {
      timerRef.current = window.setInterval(() => {
        setAdTime(prev => {
          const newTime = prev - 1;
          
          // Update progress
          setProgress(Math.floor(((ad.duration - newTime) / ad.duration) * 100));
          
          // Check if ad is complete
          if (newTime <= 0) {
            // Clear interval
            if (timerRef.current) clearInterval(timerRef.current);
            
            // Mark reward as earned
            setHasEarnedReward(true);
            setCanSkip(true);
            
            return 0;
          }
          
          // Allow skipping after watching at least 50% of ad
          if (newTime <= ad.duration / 2) {
            setCanSkip(true);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, adTime, ad.duration]);
  
  // Auto-play the ad when component mounts
  useEffect(() => {
    const playAd = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Error auto-playing ad:', error);
        }
      }
    };
    
    playAd();
  }, []);
  
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleComplete = () => {
    onComplete(hasEarnedReward ? ad.tokenReward : 0);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          src={ad.videoUrl}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setHasEarnedReward(true);
            setCanSkip(true);
            setProgress(100);
            setAdTime(0);
          }}
        />
        
        {/* Ad info overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-primary text-white">
                AD
              </span>
              <h3 className="text-white text-lg font-medium mt-1">{ad.title}</h3>
            </div>
            
            {canSkip && (
              <button
                onClick={handleComplete}
                className="text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium"
              >
                Skip Ad
              </button>
            )}
          </div>
          
          <div className="mt-3 flex items-center gap-3">
            <div className="w-full">
              <Progress value={progress} className="h-1" />
            </div>
            <span className="text-white text-sm font-medium min-w-[40px] text-right">
              {adTime}s
            </span>
          </div>
        </div>
        
        {/* Reward info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-white text-center">
            {hasEarnedReward ? (
              <div className="bg-primary/20 backdrop-blur-lg p-3 rounded-lg inline-block">
                <p className="text-lg font-bold">
                  You earned {ad.tokenReward} tokens!
                </p>
                <Button
                  onClick={handleComplete}
                  className="mt-2 bg-primary hover:bg-primary/90"
                >
                  Collect & Continue
                </Button>
              </div>
            ) : (
              <p>
                Watch the ad to earn <span className="font-bold">{ad.tokenReward} tokens</span>
              </p>
            )}
          </div>
        </div>
        
        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center transition-opacity duration-300"
          style={{ opacity: isPlaying ? 0 : 1 }}
        >
          {isPlaying ? (
            <PauseIcon className="w-8 h-8 text-white" />
          ) : (
            <PlayIcon className="w-8 h-8 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AdOverlay;
