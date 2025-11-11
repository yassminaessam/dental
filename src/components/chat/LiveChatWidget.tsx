'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { X, Send, MessageCircle, Minimize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  senderType: 'patient' | 'staff';
  senderName: string;
  message: string;
  createdAt: string;
}

interface LiveChatWidgetProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export function LiveChatWidget({ open, onClose, userEmail, userName }: LiveChatWidgetProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string | null>(null);
  const [minimized, setMinimized] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 3 seconds when chat is open
  React.useEffect(() => {
    if (!open || !conversationId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [open, conversationId]);

  // Initialize conversation when chat opens
  React.useEffect(() => {
    if (open && !conversationId) {
      initializeConversation();
    }
  }, [open]);

  const initializeConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: userName || 'ضيف',
          patientEmail: userEmail,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversationId(data.conversation.id);
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;

    const messageText = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: messageText,
          senderType: 'patient',
          senderName: userName || 'ضيف',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-full max-w-md sm:w-96">
      <Card className={cn(
        "shadow-2xl border-2 border-muted transition-all duration-300",
        minimized ? "h-16" : "h-[600px] flex flex-col"
      )}>
        {/* Header */}
        <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">المحادثة المباشرة</CardTitle>
                <CardDescription className="text-white/90 text-xs">
                  نحن هنا لمساعدتك
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setMinimized(!minimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!minimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mb-4 text-purple-300" />
                  <p className="text-sm font-medium">مرحباً بك في الدعم المباشر</p>
                  <p className="text-xs mt-2">كيف يمكننا مساعدتك اليوم؟</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.senderType === 'patient' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
                      msg.senderType === 'patient'
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border"
                    )}
                  >
                    <p className="text-xs font-semibold mb-1 opacity-80">
                      {msg.senderName}
                    </p>
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p className={cn(
                      "text-xs mt-1 opacity-70",
                      msg.senderType === 'patient' ? "text-right" : "text-left"
                    )}>
                      {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="border-t p-4 bg-background">
              <div className="flex gap-2">
                <Input
                  placeholder="اكتب رسالتك..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1 text-right"
                  dir="rtl"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
