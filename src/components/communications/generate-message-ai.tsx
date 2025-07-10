
'use client';

import * as React from 'react';
import {
  generateMessage,
  type GenerateMessageInput,
  type GenerateMessageOutput,
} from '@/ai/flows/generate-message-flow';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, Loader2 } from 'lucide-react';
import { Label } from '../ui/label';

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
  const [context, setContext] =
    React.useState<GenerateMessageInput['context']>('appointment-reminder');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = async () => {
    if (!patientName) {
      // Ideally, you'd show a toast or inline error here
      alert('Please select a patient first.');
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
      alert('Failed to generate message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-lg border bg-secondary/50 p-4">
      <div className="grid gap-4 md:grid-cols-2 md:items-end">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="message-context">Message Context</Label>
          <Select
            value={context}
            onValueChange={(
              value: GenerateMessageInput['context'] | undefined
            ) => value && setContext(value)}
          >
            <SelectTrigger id="message-context">
              <SelectValue placeholder="Select context" />
            </SelectTrigger>
            <SelectContent>
              {messageContexts.map((ctx) => (
                <SelectItem key={ctx.value} value={ctx.value}>
                  {ctx.label}
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
          Ask AI to Write
        </Button>
      </div>
    </div>
  );
}
