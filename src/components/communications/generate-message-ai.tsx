
'use client';

import * as React from 'react';
import {
  generateMessage,
  type GenerateMessageInput,
  type GenerateMessageOutput,
} from '../../ai/flows/generate-message-flow';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Wand2, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface GenerateMessageAiProps {
  patientName: string;
  onGeneration: (result: GenerateMessageOutput) => void;
}

const messageContexts = [
  { value: 'appointment-confirmation', label: 'Appointment Confirmation' },
  { value: 'appointment-reminder', label: 'Appointment Reminder' },
  { value: 'post-treatment-follow-up', label: 'Post-Treatment Follow-up' },
  { value: 'billing-reminder', label: 'Billing Reminder' },
  { value: 'request-feedback', label: 'Request Feedback' },
];

export function GenerateMessageAi({
  patientName,
  onGeneration,
}: GenerateMessageAiProps) {
  const { t, isRTL } = useLanguage();
  const [context, setContext] =
    React.useState<GenerateMessageInput['context']>('appointment-reminder');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = async () => {
    if (!patientName) {
      // Ideally, you'd show a toast or inline error here
      alert(t('communications.select_patient'));
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateMessage({
        patientName,
        context,
      });
      onGeneration(result);
    } catch (error) {
      console.error('Failed to generate message:', error);
      // Ideally, you'd show a toast error here
      alert(t('communications.toast.error_sending_message'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-lg border bg-secondary/50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="grid gap-4 md:grid-cols-2 md:items-end">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="message-context">{t('communications.message_type')}</Label>
          <Select
            value={context}
            onValueChange={(value: string) => setContext(value as GenerateMessageInput['context'])}
          >
            <SelectTrigger id="message-context">
              <SelectValue placeholder={t('communications.message_type')} />
            </SelectTrigger>
            <SelectContent>
              {messageContexts.map((ctx) => (
                <SelectItem key={ctx.value} value={ctx.value}>
                  {t('communications.' + ctx.value).startsWith('communications.') ? ctx.label : t('communications.' + ctx.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !patientName}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {t('ai.generate') ?? 'Ask AI to Write'}
        </Button>
      </div>
    </div>
  );
}
