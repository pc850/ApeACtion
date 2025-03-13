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

// Updated mock video data with more mature-themed content for testing
const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Hot Tub Stream - Special Edition',
    creator: 'CandyQueen',
    thumbnailUrl: 'https://images.unsplash.com/photo-1552663651-2e4250e6c7e8',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    likes: 4542,
    views: 42300,
    isLive: true,
    platform: 'AdultStream',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    creatorId: 'candy123',
    chatCost: 25
  },
  {
    id: '2',
    title: 'Bedroom Yoga Session 18+',
    creator: 'FlexiGirl',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    likes: 3982,
    views: 28750,
    isLive: false,
    platform: 'AdultStream',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    creatorId: 'flexi456',
    chatCost: 30
  },
  {
    id: '3',
    title: 'Intimate Dance Tutorial For Adults',
    creator: 'DanceSeduction',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545171709-47bd85caf3b0',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    likes: 5341,
    views: 39800,
    isLive: true,
    platform: 'AdultStream',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    creatorId: 'dance789',
    chatCost: 40
  },
  {
    id: '4',
    title: 'Lingerie Try-On Haul',
    creator: 'FashionSecret',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583846783214-7229a91b20ed',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    likes: 8121,
    views: 67650,
    isLive: false,
    platform: 'AdultStream',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    creatorId: 'fashion101',
    chatCost: 35
  },
  {
    id: '5',
    title: 'After Dark Talk Show',
    creator: 'NightOwl',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504276048855-f3d60e69632f',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    likes: 6421,
    views: 58500,
    isLive: true,
    platform: 'AdultStream',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/66.jpg',
    creatorId: 'night202',
    chatCost: 45
  },
  {
    id: '6',
    title: 'Private Gaming Stream 21+',
    creator: 'GamerGirl',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    likes: 7567,
    views: 72300,
    isLive: true,
    platform: 'AdultStream',
    creatorAvatar: 'https://randomuser.me/api/portraits/women/77.jpg',
    creatorId: 'gamer303',
    chatCost: 50
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
