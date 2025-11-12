'use client';

import React from 'react';
import { PatientOnly } from '@/components/auth/ProtectedRoute';
import PatientLayout from '@/components/layout/PatientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Inbox } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function PatientMessagesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = React.useState<any[]>([]);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [messageContent, setMessageContent] = React.useState('');
  const [selectedConversation, setSelectedConversation] = React.useState<any>(null);

  React.useEffect(() => {
    if (user?.email) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user?.email) return;
    
    try {
      const response = await fetch(`/api/patient/chat?patientEmail=${encodeURIComponent(user.email)}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      const convs = data.conversations || [];
      setConversations(convs);
      
      if (convs.length > 0) {
        setSelectedConversation(convs[0]);
        setMessages(convs[0].messages || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a message',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/patient/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail: user?.email,
          patientName: `${user?.firstName} ${user?.lastName}`,
          message: messageContent,
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast({
        title: t('patient_pages.messages.message_sent'),
        description: t('patient_pages.messages.message_sent_desc')
      });

      setMessageContent('');
      fetchConversations();
    } catch (error) {
      toast({
        title: t('patient_pages.messages.error_sending'),
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };
  if (loading) {
    return (
      <PatientOnly>
        <PatientLayout>
          <div className="p-6 flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-pulse text-lg">{t('common.loading')}</div>
            </div>
          </div>
        </PatientLayout>
      </PatientOnly>
    );
  }

  return (
    <PatientOnly>
      <PatientLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('patient_pages.messages.title')}</h1>
            <p className="text-gray-600">{t('patient_pages.messages.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Inbox className="h-5 w-5 mr-2" />
                    {t('patient_pages.messages.inbox')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {conversations.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No conversations yet</p>
                    ) : conversations.map((conversation) => {
                      const lastMessage = conversation.messages?.[0];
                      const unreadCount = conversation.messages?.filter((m: any) => !m.isRead && m.senderType === 'staff').length || 0;
                      
                      return (
                        <div 
                          key={conversation.id}
                          className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                            unreadCount > 0 ? 'bg-blue-50' : ''
                          } ${selectedConversation?.id === conversation.id ? 'border-2 border-primary' : ''}`}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            setMessages(conversation.messages || []);
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-sm">
                              {conversation.staffName || 'CairoDental Support'}
                            </p>
                            {unreadCount > 0 && (
                              <Badge variant="default" className="text-xs">{unreadCount}</Badge>
                            )}
                          </div>
                          {lastMessage && (
                            <>
                              <p className="text-xs text-gray-600 truncate">{lastMessage.message}</p>
                              <p className="text-xs text-gray-500">{new Date(lastMessage.createdAt).toLocaleDateString()}</p>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Thread / Compose */}
            <div className="lg:col-span-2">
              {selectedConversation && messages.length > 0 ? (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      {t('patient_pages.messages.conversation')}
                    </CardTitle>
                    <CardDescription>
                      with {selectedConversation.staffName || 'CairoDental Support'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {messages.slice().reverse().map((message: any, index: number) => (
                        <div 
                          key={message.id || index}
                          className={`p-3 rounded-lg ${
                            message.senderType === 'patient' 
                              ? 'bg-primary text-white ml-auto max-w-[80%]' 
                              : 'bg-gray-100 mr-auto max-w-[80%]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-medium">{message.senderName}</p>
                            <p className="text-xs opacity-75">
                              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Send className="h-5 w-5 mr-2" />
                    {t('patient_pages.messages.send_message')}
                  </CardTitle>
                  <CardDescription>{t('patient_pages.messages.new_message')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t('patient_pages.messages.message')}</label>
                      <Textarea 
                        placeholder={t('patient_pages.messages.message_placeholder')} 
                        rows={6}
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={handleSendMessage}
                      disabled={sending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sending ? t('common.uploading') : t('patient_pages.messages.send')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
