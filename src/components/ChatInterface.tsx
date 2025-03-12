import { useState, useEffect, useRef } from 'react';
import { useTokens } from '@/context/TokenContext';
import { Video } from '@/context/VideoContext';
import { 
  fetchChatHistory, 
  sendChatMessage, 
  simulateCreatorResponse,
  type ChatMessage 
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { CoinsIcon, SendIcon } from 'lucide-react';

interface ChatInterfaceProps {
  video: Video;
}

const ChatInterface = ({ video }: ChatInterfaceProps) => {
  const { tokens, spendTokens } = useTokens();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadChatHistory = async () => {
      setIsLoading(true);
      try {
        const history = await fetchChatHistory(video.creatorId);
        setChatHistory(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChatHistory();
  }, [video.creatorId]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const canSend = spendTokens(video.chatCost);
    if (!canSend) return;
    
    setIsLoading(true);
    
    try {
      const userMessage = await sendChatMessage(video.creatorId, message);
      setChatHistory(prev => [...prev, userMessage]);
      
      setMessage('');
      
      const creatorMessage = await simulateCreatorResponse(video.creatorId);
      setChatHistory(prev => [...prev, creatorMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
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
            <p className="text-sm text-muted-foreground">
              {video.isLive ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  LIVE NOW
                </span>
              ) : "Creator"}
            </p>
          </div>
        </div>
      </div>
      
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollAreaRef as React.RefObject<HTMLDivElement>}
      >
        <div className="space-y-4">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.isFromCreator ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.isFromCreator
                    ? 'bg-muted text-foreground rounded-tl-none'
                    : 'bg-primary text-primary-foreground rounded-tr-none'
                }`}
              >
                <div className="flex flex-col">
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70 mt-1 self-end">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted text-foreground">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-card">
        <div className="flex items-center gap-2">
          <div className="flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <CoinsIcon className="w-4 h-4 mr-1" />
            <span>{video.chatCost} per message</span>
          </div>
          
          <div className="ml-auto text-sm text-muted-foreground">
            {tokens} tokens available
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Send a message to ${video.creator}...`}
            className="min-h-12 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim() || tokens < video.chatCost}
            className="flex-shrink-0"
          >
            <SendIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
