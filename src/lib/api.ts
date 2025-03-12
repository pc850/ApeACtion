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
  creatorId: string,
  userMessage: string
): Promise<ChatMessage> => {
  await delay(1000 + Math.random() * 2000);
  
  const lowerCaseMessage = userMessage.toLowerCase();
  let response = '';
  
  if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('hey')) {
    response = "Hey there! So glad you stopped by my stream today! How are you doing?";
  } else if (lowerCaseMessage.includes('how are you') || lowerCaseMessage.includes("how are you doing") || lowerCaseMessage.includes('how are things')) {
    response = "I'm doing fantastic today! Just really enjoying this stream and chatting with awesome viewers like you. How about yourself?";
  } else if (lowerCaseMessage.includes('what') && (lowerCaseMessage.includes('doing') || lowerCaseMessage.includes('up to'))) {
    response = "Right now I'm just streaming and chatting with my viewers! I might do some gaming later, or maybe a Q&A session. Any preferences?";
  } else if (lowerCaseMessage.includes('love') || lowerCaseMessage.includes('like') || lowerCaseMessage.includes('enjoy')) {
    response = "Aww, that's so sweet! I really appreciate your support. It means a lot to me that you enjoy my content!";
  } else if (lowerCaseMessage.includes('?')) {
    response = "That's a great question! I think the best way to look at it is to consider what makes you happy. What do you think?";
  } else if (lowerCaseMessage.includes('thank')) {
    response = "You're so welcome! I'm always happy to chat with my viewers. That's what makes streaming so fun for me!";
  } else if (lowerCaseMessage.includes('help') || lowerCaseMessage.includes('advice')) {
    response = "I'd be happy to help! What specifically are you looking for advice about? I might not be an expert, but I'll try my best!";
  } else if (lowerCaseMessage.includes('joke') || lowerCaseMessage.includes('funny')) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "What's the best thing about Switzerland? I don't know, but the flag is a big plus!",
      "I told my wife she was drawing her eyebrows too high. She looked surprised!",
      "Why did the scarecrow win an award? Because he was outstanding in his field!"
    ];
    response = jokes[Math.floor(Math.random() * jokes.length)];
  } else if (lowerCaseMessage.length < 10) {
    response = "I'd love to hear more! What's on your mind today?";
  } else {
    const defaultResponses = [
      "That's really interesting! Tell me more about it.",
      "I appreciate you sharing that with me. What else is happening in your world?",
      "I totally get what you're saying. It's always nice to connect with viewers like you!",
      "That's a unique perspective! I hadn't thought about it that way before.",
      "Thanks for chatting with me today! It's conversations like these that make streaming worthwhile.",
      "I'm really enjoying our conversation! You bring up great points.",
      "That's fascinating! I'd love to hear more about your thoughts on this topic."
    ];
    response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  const personalityTouches = [
    "",
    " 💕",
    " 😊",
    " What about you?",
    " I'm curious what you think!",
    " Thanks for asking!",
    " Really appreciate your message!",
    ""
  ];
  
  if (Math.random() > 0.5) {
    response += personalityTouches[Math.floor(Math.random() * personalityTouches.length)];
  }
  
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
