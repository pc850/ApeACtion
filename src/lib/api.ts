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
  
  // Return simulated chat history with more flirtatious content
  return [
    {
      id: '1',
      senderId: 'system',
      content: 'Welcome to the adult chat! The performer will respond when available.',
      timestamp: new Date(Date.now() - 60000 * 5),
      isFromCreator: false
    },
    {
      id: '2',
      senderId: creatorId,
      content: 'Hey there, welcome to my private room! I\'m so excited to chat with you today. What would you like to talk about?',
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
  creatorId: string,
  userMessage: string
): Promise<ChatMessage> => {
  await delay(1000 + Math.random() * 2000);
  
  const lowerCaseMessage = userMessage.toLowerCase();
  let response = '';
  
  if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hey')) {
    response = "Hey there gorgeous! I'm so happy you stopped by my stream today! How are you feeling?";
  } else if (lowerCaseMessage.includes('how are you') || lowerCaseMessage.includes("how are you doing")) {
    response = "I'm feeling amazing today! Just enjoying some me-time and chatting with special viewers like you. What about you, handsome?";
  } else if (lowerCaseMessage.includes('what') && (lowerCaseMessage.includes('doing') || lowerCaseMessage.includes('up to'))) {
    response = "Just relaxing in my special room and connecting with my fans. I might do something special later. Would you like to keep me company?";
  } else if (lowerCaseMessage.includes('love') || lowerCaseMessage.includes('like') || lowerCaseMessage.includes('enjoy')) {
    response = "Aww, you're making me blush! I love connecting with admirers like you. You're definitely one of my favorites now!";
  } else if (lowerCaseMessage.includes('?')) {
    response = "Mmm, that's an interesting question! I think we could explore that together, what do you think? I'm always open to new experiences.";
  } else if (lowerCaseMessage.includes('thank')) {
    response = "You're so welcome, sweetie! I'm always happy to chat with someone special like you. That's what makes my day exciting!";
  } else if (lowerCaseMessage.includes('help') || lowerCaseMessage.includes('advice')) {
    response = "I'd be happy to help you with anything you need, honey. What kind of advice are you looking for? I have many talents...";
  } else if (lowerCaseMessage.length < 10) {
    response = "Don't be shy now! Tell me more about what's on your mind today. I'm all yours in this private chat.";
  } else {
    const defaultResponses = [
      "I love how thoughtful you are. Tell me more about your desires...",
      "That's fascinating! I'd love to explore that topic more deeply with you.",
      "You're so interesting to talk to! I feel like we have a special connection.",
      "I'm getting excited just chatting with you. What else would you like to discuss?",
      "I wish all my viewers were as engaging as you. You really know how to keep a conversation going.",
      "I'm blushing! You're making this stream so much more enjoyable for me.",
      "I can't wait to hear more of your thoughts. You're keeping me very entertained!"
    ];
    response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  const personalityTouches = [
    "💋",
    "😘",
    "💕",
    "❤️",
    "😉",
    "What about you, handsome?",
    "I'm all yours tonight...",
    "Can't wait to hear more from you...",
    "You're making my day so much better!"
  ];
  
  // Always add a personality touch for more flirtatious responses
  response += " " + personalityTouches[Math.floor(Math.random() * personalityTouches.length)];
  
  return {
    id: `creator-${Date.now()}`,
    senderId: creatorId,
    content: response,
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
      title: 'Premium Membership Offer',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      duration: 15,
      tokenReward: 15
    },
    {
      id: 'ad2',
      title: 'Exclusive Content Announcement',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      duration: 20,
      tokenReward: 20
    },
    {
      id: 'ad3',
      title: 'Special Private Event Coming Soon',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      duration: 10,
      tokenReward: 10
    }
  ];
  
  return ads[Math.floor(Math.random() * ads.length)];
};
