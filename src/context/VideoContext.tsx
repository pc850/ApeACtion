
import { createContext, useContext, useState, ReactNode } from 'react';

export interface Video {
  id: string;
  title: string;
  creator: string;
  thumbnailUrl: string;
  videoUrl: string;
  likes: number;
  views: number;
  isLive: boolean;
  platform: string;
  creatorAvatar: string;
  creatorId: string;
  chatCost: number;
}

interface VideoContextType {
  videos: Video[];
  loadVideos: () => Promise<void>;
  currentVideoIndex: number;
  setCurrentVideoIndex: (index: number) => void;
  shouldShowAd: (index: number) => boolean;
  markAdViewed: () => void;
  selectedVideo: Video | null;
  setSelectedVideo: (video: Video | null) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Mock video data - in a real app, this would come from an API
const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Summer Beach Vibes',
    creator: 'BeachyQueen',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    likes: 1542,
    views: 12300,
    isLive: true,
    platform: 'StreamPlatform',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    creatorId: 'beachy123',
    chatCost: 5
  },
  {
    id: '2',
    title: 'Sunset Meditation Session',
    creator: 'ZenMaster',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    likes: 982,
    views: 8750,
    isLive: false,
    platform: 'StreamPlatform',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    creatorId: 'zen456',
    chatCost: 10
  },
  {
    id: '3',
    title: 'Dance Tutorial - Summer Edition',
    creator: 'DanceQueen',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    likes: 2341,
    views: 19800,
    isLive: true,
    platform: 'StreamPlatform',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    creatorId: 'dance789',
    chatCost: 8
  },
  {
    id: '4',
    title: 'Morning Yoga Routine',
    creator: 'YogaLover',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    likes: 1121,
    views: 7650,
    isLive: false,
    platform: 'StreamPlatform',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    creatorId: 'yoga101',
    chatCost: 15
  },
  {
    id: '5',
    title: 'Cooking with Style',
    creator: 'ChefPrincess',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    likes: 3421,
    views: 28500,
    isLive: true,
    platform: 'StreamPlatform',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/66.jpg',
    creatorId: 'chef202',
    chatCost: 12
  },
  {
    id: '6',
    title: 'Gaming Stream Highlights',
    creator: 'GamerGirl',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    likes: 4567,
    views: 42300,
    isLive: true,
    platform: 'StreamPlatform',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/77.jpg',
    creatorId: 'gamer303',
    chatCost: 20
  },
];

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [adCountdown, setAdCountdown] = useState<number>(2); // Show ad after 3 videos
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const loadVideos = async (): Promise<void> => {
    // In a real app, this would fetch videos from an API
    // For now, we'll just use the mock data
    setVideos(mockVideos);
  };

  const shouldShowAd = (index: number): boolean => {
    // Show an ad every 3 videos (0-indexed)
    return index > 0 && (index + 1) % 3 === 0 && adCountdown <= 0;
  };

  const markAdViewed = (): void => {
    setAdCountdown(2); // Reset ad counter after viewing
  };

  return (
    <VideoContext.Provider value={{
      videos,
      loadVideos,
      currentVideoIndex,
      setCurrentVideoIndex,
      shouldShowAd,
      markAdViewed,
      selectedVideo,
      setSelectedVideo
    }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideos = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
};
