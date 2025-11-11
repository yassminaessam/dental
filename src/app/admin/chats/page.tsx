'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2, Users, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import DashboardShell from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatMessage {
  id: string;
  senderType: 'patient' | 'staff';
  senderName: string;
  message: string;
  createdAt: string;
}

interface ChatConversation {
  id: string;
  patientName: string;
  patientEmail?: string;
  status: string;
  lastMessageAt: string;
  messages: ChatMessage[];
}

export default function AdminChatsPage() {
  const { isRTL } = useLanguage();
  const [conversations, setConversations] = React.useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations (including patient messages)
  const fetchConversations = React.useCallback(async () => {
    try {
      // Fetch live chat conversations
      const chatResponse = await fetch('/api/chat/conversations');
      const chatData = chatResponse.ok ? await chatResponse.json() : { conversations: [] };
      
      // Fetch patient messages
      const messagesResponse = await fetch('/api/patient-messages/all');
      const messagesData = messagesResponse.ok ? await messagesResponse.json() : { conversations: [] };
      
      // Combine both
      const allConversations = [
        ...(chatData.conversations || []),
        ...(messagesData.conversations || [])
      ];
      
      // Sort by last message date
      allConversations.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      
      setConversations(allConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = React.useCallback(async (conversationId: string) => {
    try {
      // Check if this is a patient message conversation or live chat
      if (conversationId.startsWith('patient-msg-')) {
        // For patient messages, get from the conversation object itself
        const conv = conversations.find(c => c.id === conversationId);
        if (conv) {
          setMessages(conv.messages || []);
        }
      } else {
        // For live chat, fetch from API
        const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [conversations]);

  // Poll for updates
  React.useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  React.useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      const interval = setInterval(() => fetchMessages(selectedConversation), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, fetchMessages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConversation) return;

    const messageText = input.trim();
    setInput('');
    setSending(true);

    try {
      // Check if this is a patient message conversation or live chat
      if (selectedConversation.startsWith('patient-msg-')) {
        // Send reply to patient messages
        const selectedConv = conversations.find(c => c.id === selectedConversation);
        if (selectedConv) {
          const response = await fetch('/api/patient-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientEmail: selectedConv.patientEmail,
              patientName: selectedConv.patientName,
              subject: `Re: ${selectedConv.messages[0]?.subject || 'Reply'}`,
              message: messageText,
              from: 'فريق الدعم',
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setMessages((prev) => [...prev, {
              id: data.messageId,
              senderType: 'staff',
              senderName: 'فريق الدعم',
              message: messageText,
              createdAt: new Date().toISOString(),
            }]);
            fetchConversations(); // Refresh conversation list
          }
        }
      } else {
        // Send to live chat
        const response = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: selectedConversation,
            message: messageText,
            senderType: 'staff',
            senderName: 'فريق الدعم',
            senderId: 'admin',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessages((prev) => [...prev, data.message]);
          fetchConversations(); // Refresh conversation list
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeConversations = conversations.filter(c => c.status === 'Active');
  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <DashboardShell>
      <main className="flex w-full flex-1 flex-col gap-6 p-6 max-w-screen-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
              <MessageCircle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                إدارة المحادثات المباشرة
              </h1>
              <p className="text-muted-foreground">تواصل مع المرضى والزوار</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          <Card className="metric-card-blue">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">المحادثات النشطة</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeConversations.length}</div>
            </CardContent>
          </Card>

          <Card className="metric-card-green">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المحادثات</CardTitle>
              <MessageCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations.length}</div>
            </CardContent>
          </Card>

          <Card className="metric-card-purple">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">متوسط الاستجابة</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{'< 2 دقيقة'}</div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <CardTitle className="text-lg">المحادثات</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto h-[calc(600px-80px)]">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                  <MessageCircle className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-sm">لا توجد محادثات بعد</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={cn(
                        "w-full text-right p-4 rounded-lg transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-950/30",
                        selectedConversation === conv.id && "bg-purple-100 dark:bg-purple-950/50 border-2 border-purple-300 dark:border-purple-700"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-sm truncate">{conv.patientName}</p>
                            {(conv as any).type === 'patient-message' && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                رسالة
                              </Badge>
                            )}
                          </div>
                          {conv.messages[0] && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {(conv.messages[0] as any).subject ? `${(conv.messages[0] as any).subject}: ` : ''}
                              {conv.messages[0].message}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={conv.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                            {conv.status === 'Active' ? 'نشط' : 'مغلق'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conv.lastMessageAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedConv.patientName}</CardTitle>
                      {selectedConv.patientEmail && (
                        <p className="text-xs text-muted-foreground">{selectedConv.patientEmail}</p>
                      )}
                    </div>
                    <Badge variant={selectedConv.status === 'Active' ? 'default' : 'secondary'}>
                      {selectedConv.status === 'Active' ? 'نشط' : 'مغلق'}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.senderType === 'staff' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2 shadow-sm",
                          msg.senderType === 'staff'
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
                          msg.senderType === 'staff' ? "text-right" : "text-left"
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
                      disabled={sending}
                      className="flex-1 text-right"
                      dir="rtl"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={sending || !input.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-semibold mb-2">اختر محادثة</p>
                <p className="text-sm">حدد محادثة من القائمة للبدء في الرد</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </DashboardShell>
  );
}
