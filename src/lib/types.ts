
export type Message = {
  id: string;
  patient: string;
  type: 'SMS' | 'Email';
  content: string;
  subContent: string | null;
  status: 'Sent' | 'Delivered' | 'Read' | 'Unread';
  sent: string;
  subject?: string;
  snippet?: string;
  fullMessage?: string;
  category?: 'treatment' | 'appointment' | 'billing' | 'other';
  priority?: 'high' | 'normal' | 'low';
  date?: string;
};
