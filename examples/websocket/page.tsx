'use client';

import { useEffect, useState, useRef } from 'react';
import { pusherClient } from '@/lib/pusher-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  text: string;
  senderId: string;
  timestamp: string;
}

const CHANNEL_NAME = 'presence-demo-channel';
const EVENT_NAME = 'message';

export default function SocketDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Subscribe to Pusher channel
    const channel = pusherClient.subscribe(CHANNEL_NAME);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
      // Send welcome message
      const welcomeMsg: Message = {
        text: 'Welcome to Pusher Real-time Demo!',
        senderId: 'system',
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMsg]);
    });

    channel.bind('pusher:subscription_error', () => {
      setIsConnected(false);
      console.error('Failed to subscribe to channel');
    });

    // Listen for messages
    channel.bind(EVENT_NAME, (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    // Handle connection state
    pusherClient.connection.bind('connected', () => {
      setIsConnected(true);
    });

    pusherClient.connection.bind('disconnected', () => {
      setIsConnected(false);
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherClient.unsubscribe(CHANNEL_NAME);
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!isConnected || !inputMessage.trim()) return;

    const message: Message = {
      text: inputMessage.trim(),
      senderId: pusherClient.connection.socket_id || 'user',
      timestamp: new Date().toISOString(),
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, message]);

    // Send message to server via API route
    try {
      await fetch('/api/pusher/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Pusher Real-time Demo
            <span className={`text-sm px-2 py-1 rounded ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-80 w-full border rounded-md p-4">
            <div className="space-y-2">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center">No messages yet</p>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {msg.senderId}
                        </p>
                        <p className="text-gray-900">{msg.text}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={!isConnected}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!isConnected || !inputMessage.trim()}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
