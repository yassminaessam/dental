'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Loader2, Users, Clock, CheckCircle2, Sparkles } from 'lucide-react';
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
  const { isRTL, t, language } = useLanguage();
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
              subject: `Re: ${((selectedConv.messages[0] as any)?.subject as string) || 'Reply'}`,
              message: messageText,
              from: t('page.admin_chats.support_team'),
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setMessages((prev) => [...prev, {
              id: data.messageId,
              senderType: 'staff',
              senderName: t('page.admin_chats.support_team'),
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
            senderName: t('page.admin_chats.support_team'),
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
      <main className="flex w-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-rose-500/5 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-background/80 via-background/90 to-background/80 backdrop-blur-xl rounded-3xl border-2 border-muted/50 p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl">
                  <MessageCircle className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent animate-gradient">
                  {t('page.admin_chats.title')}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('page.admin_chats.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid gap-1.5 grid-cols-1 sm:grid-cols-3">
          <Card className="metric-card-blue group hover:scale-105 transition-transform duration-300 min-h-0">
            <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5">
              <CardTitle className="text-sm font-semibold leading-tight">{t('page.admin_chats.active_chats')}</CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="p-1.5 pt-0">
              <div className="text-lg font-bold leading-tight">{activeConversations.length}</div>
              <p className="text-xs text-muted-foreground leading-tight">{t('page.admin_chats.active_chats_desc')}</p>
            </CardContent>
          </Card>

          <Card className="metric-card-green group hover:scale-105 transition-transform duration-300 min-h-0">
            <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5">
              <CardTitle className="text-sm font-semibold leading-tight">{t('page.admin_chats.total_chats')}</CardTitle>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="p-1.5 pt-0">
              <div className="text-lg font-bold leading-tight">{conversations.length}</div>
              <p className="text-xs text-muted-foreground leading-tight">{t('page.admin_chats.total_chats_desc')}</p>
            </CardContent>
          </Card>

          <Card className="metric-card-purple group hover:scale-105 transition-transform duration-300 min-h-0">
            <CardHeader className="flex flex-row items-center justify-between pb-0.5 p-1.5">
              <CardTitle className="text-sm font-semibold leading-tight">{t('page.admin_chats.avg_response')}</CardTitle>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="p-1.5 pt-0">
              <div className="text-lg font-bold leading-tight">{t('page.admin_chats.avg_response_value')}</div>
              <p className="text-xs text-muted-foreground leading-tight">{t('page.admin_chats.avg_response_desc')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 overflow-hidden border-2 border-muted hover:border-purple-200 dark:hover:border-purple-900 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <MessageCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">{t('page.admin_chats.conversations')}</CardTitle>
                {conversations.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {conversations.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto h-[calc(600px-80px)]">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                  <MessageCircle className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-sm">{t('page.admin_chats.no_conversations')}</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations.map((conv) => {
                    const messageDate = new Date(conv.lastMessageAt);
                    const now = new Date();
                    const isToday = messageDate.toDateString() === now.toDateString();
                    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === messageDate.toDateString();
                    
                    return (
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
                                  {t('page.admin_chats.message_label')}
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
                              {conv.status === 'Active' ? t('page.admin_chats.active_status') : t('page.admin_chats.closed_status')}
                            </Badge>
                            <div className="text-xs text-muted-foreground text-left">
                              <div className="font-medium">
                                {isToday 
                                  ? t('page.admin_chats.today')
                                  : isYesterday 
                                  ? t('page.admin_chats.yesterday')
                                  : messageDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                      day: 'numeric',
                                      month: 'short'
                                    })
                                }
                              </div>
                              <div className="text-xs opacity-70">
                                {messageDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden border-2 border-muted hover:border-pink-200 dark:hover:border-pink-900 shadow-lg hover:shadow-xl transition-all duration-300">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                        {selectedConv.patientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{selectedConv.patientName}</CardTitle>
                        {selectedConv.patientEmail && (
                          <p className="text-xs text-muted-foreground">{selectedConv.patientEmail}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={selectedConv.status === 'Active' ? 'default' : 'secondary'}
                      className="shadow-sm"
                    >
                      {selectedConv.status === 'Active' ? `🟢 ${t('page.admin_chats.active_status')}` : `⚫ ${t('page.admin_chats.closed_status')}`}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                  {messages.map((msg, index) => {
                    const msgDate = new Date(msg.createdAt);
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const prevMsgDate = prevMsg ? new Date(prevMsg.createdAt) : null;
                    const showDateDivider = !prevMsgDate || msgDate.toDateString() !== prevMsgDate.toDateString();
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {/* Date Divider */}
                        {showDateDivider && (
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-sm border text-xs font-medium text-muted-foreground">
                              {msgDate.toDateString() === new Date().toDateString() 
                                ? t('page.admin_chats.today')
                                : msgDate.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
                                ? t('page.admin_chats.yesterday')
                                : msgDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                              }
                            </div>
                          </div>
                        )}
                        
                        {/* Message */}
                        <div
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
                              "text-xs mt-1 opacity-70 flex items-center gap-1",
                              msg.senderType === 'staff' ? "justify-end" : "justify-start"
                            )}>
                              <Clock className="h-3 w-3" />
                              {msgDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Enhanced Input */}
                <div className="border-t p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('page.admin_chats.type_message')}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      className="flex-1 text-right border-2 focus:border-purple-400 dark:focus:border-purple-600 transition-colors"
                      dir="rtl"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={sending || !input.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse"></div>
                  <MessageCircle className="h-20 w-20 relative opacity-30" />
                </div>
                <p className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  {t('page.admin_chats.select_conversation')}
                </p>
                <p className="text-sm max-w-xs">{t('page.admin_chats.select_conversation_desc')}</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </DashboardShell>
  );
}
