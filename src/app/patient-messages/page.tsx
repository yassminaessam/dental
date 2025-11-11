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
  const [messages, setMessages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [subject, setSubject] = React.useState('');
  const [messageContent, setMessageContent] = React.useState('');
  const [selectedMessage, setSelectedMessage] = React.useState<any>(null);

  React.useEffect(() => {
    if (user?.email) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/patient-messages?patientEmail=${user?.email}`);
      const data = await response.json();
      setMessages(data.messages || []);
      if (data.messages && data.messages.length > 0) {
        setSelectedMessage(data.messages[0]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !messageContent.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both subject and message',
        variant: 'destructive'
      });
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/patient-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientEmail: user?.email,
          patientName: `${user?.firstName} ${user?.lastName}`,
          subject,
          message: messageContent,
          from: `${user?.firstName} ${user?.lastName}`
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      toast({
        title: t('patient_pages.messages.message_sent'),
        description: t('patient_pages.messages.message_sent_desc')
      });

      setSubject('');
      setMessageContent('');
      fetchMessages();
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
            {/* Message List */}
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
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No messages yet</p>
                    ) : messages.map((message, index) => (
                      <div 
                        key={message.id || index}
                        className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          message.status === 'unread' ? 'bg-blue-50' : ''
                        } ${selectedMessage?.id === message.id ? 'border-2 border-primary' : ''}`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm">{message.subject}</p>
                          {message.status === 'unread' && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{message.from}</p>
                        <p className="text-xs text-gray-500">{new Date(message.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Detail / Compose */}
            <div className="lg:col-span-2">
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
                      <label className="text-sm font-medium mb-2 block">{t('patient_pages.messages.subject')}</label>
                      <Input 
                        placeholder={t('patient_pages.messages.subject_placeholder')} 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t('patient_pages.messages.message')}</label>
                      <Textarea 
                        placeholder={t('patient_pages.messages.message_placeholder')} 
                        rows={8}
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

              {/* Recent Message Detail */}
              {selectedMessage && (
                <Card className="mt-4">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{selectedMessage.subject}</CardTitle>
                        <CardDescription>{t('patient_pages.messages.from')}: {selectedMessage.from}</CardDescription>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(selectedMessage.date).toLocaleDateString()}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedMessage.content}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSubject(`Re: ${selectedMessage.subject}`);
                        setMessageContent('');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {t('patient_pages.messages.reply')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </PatientLayout>
    </PatientOnly>
  );
}
