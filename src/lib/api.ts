
// In a real application, this would contain actual API calls
// For now, we'll use simulated API functions

import { Video } from '@/context/VideoContext';

// Simulate API request delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch videos from streaming platforms
export const fetchVideos = async (): Promise<Video[]> => {
  // Simulate API call
  await delay(1000);
  
  // This would be replaced with actual API integration in a real app
  // Using the mock data from VideoContext for now
  return [];
};

// Simulated API for chat messages
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isFromCreator: boolean;
}

export const fetchChatHistory = async (creatorId: string): Promise<ChatMessage[]> => {
  // Simulate API call
  await delay(800);
  
  // Return simulated chat history
  return [
    {
      id: '1',
      senderId: 'system',
      content: 'Welcome to the chat! The creator will respond when available.',
      timestamp: new Date(Date.now() - 60000 * 5),
      isFromCreator: false
    },
    {
      id: '2',
      senderId: creatorId,
      content: 'Hey everyone! Thanks for joining my stream today. Feel free to ask questions!',
      timestamp: new Date(Date.now() - 60000 * 2),
      isFromCreator: true
    }
  ];
};

export const sendChatMessage = async (
  creatorId: string, 
  content: string
): Promise<ChatMessage> => {
  // Simulate API call
  await delay(500);
  
  // Return simulated response
  return {
    id: Date.now().toString(),
    senderId: 'user',
    content,
    timestamp: new Date(),
    isFromCreator: false
  };
};

export const simulateCreatorResponse = async (
  creatorId: string
): Promise<ChatMessage> => {
  // Simulate API call
  await delay(2000 + Math.random() * 3000); // Random delay between 2-5 seconds
  
  const responses = [
    "Thanks for your message! I appreciate the support.",
    "Hello there! Great to see you in my chat.",
    "Thanks for watching my stream! What did you think?",
    "I'm glad you're enjoying the content! More coming soon.",
    "Feel free to ask any questions about what I'm doing!",
    "Don't forget to follow if you're enjoying the stream!",
  ];
  
  // Return simulated creator response
  return {
    id: `creator-${Date.now()}`,
    senderId: creatorId,
    content: responses[Math.floor(Math.random() * responses.length)],
    timestamp: new Date(),
    isFromCreator: true
  };
};

// Simulated API for ads
export interface Ad {
  id: string;
  title: string;
  videoUrl: string;
  duration: number; // in seconds
  tokenReward: number;
}

export const fetchRandomAd = async (): Promise<Ad> => {
  // Simulate API call
  await delay(600);
  
  const ads: Ad[] = [
    {
      id: 'ad1',
      title: 'Premium Subscription Offer',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: 15,
      tokenReward: 5
    },
    {
      id: 'ad2',
      title: 'New Feature Announcement',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      duration: 20,
      tokenReward: 8
    },
    {
      id: 'ad3',
      title: 'Special Event Coming Soon',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      duration: 10,
      tokenReward: 3
    }
  ];
  
  return ads[Math.floor(Math.random() * ads.length)];
};
