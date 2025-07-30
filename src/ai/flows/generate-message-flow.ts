'use server';

/**
 * @fileOverview Provides AI-driven message generation for patient communication.
 *
 * - generateMessageFlow - A function that generates a message draft based on a given context.
 * - GenerateMessageInput - The input type for the generateMessageFlow function.
 * - GenerateMessageOutput - The return type for the generateMessageFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageContextSchema = z.enum([
  'appointment-reminder',
  'appointment-confirmation',
  'post-treatment-follow-up',
  'billing-reminder',
  'request-feedback',
]);

const GenerateMessageInputSchema = z.object({
  patientName: z.string().describe('The name of the patient.'),
  context: MessageContextSchema.describe('The context for the message.'),
});
export type GenerateMessageInput = z.infer<typeof GenerateMessageInputSchema>;

const GenerateMessageOutputSchema = z.object({
  subject: z.string().describe('A concise subject line for the message.'),
  message: z.string().describe('The full, professionally-written message body.'),
});
export type GenerateMessageOutput = z.infer<
  typeof GenerateMessageOutputSchema
>;

export async function generateMessage(
  input: GenerateMessageInput
): Promise<GenerateMessageOutput> {
  return generateMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMessagePrompt',
  input: { schema: GenerateMessageInputSchema },
  output: { schema: GenerateMessageOutputSchema },
  prompt: `You are an expert communications assistant for a dental practice called DentalPro. Your task is to draft clear, friendly, and professional messages to patients.

The message should be addressed to {{{patientName}}}.

The context for the message is: {{{context}}}.

- For 'appointment-confirmation', create a message confirming a new appointment. Use placeholders like [Date] and [Time].
- For 'appointment-reminder', create a gentle reminder for an upcoming appointment. Use placeholders like [Date] and [Time].
- For 'post-treatment-follow-up', create a message checking in on the patient after a recent procedure and providing general care advice.
- For 'billing-reminder', create a polite reminder about an outstanding balance. Use a placeholder like [Amount].
- For 'request-feedback', create a friendly message asking the patient to share their experience.

Generate a suitable subject line and a full message body.
  `,
});

const generateMessageFlow = ai.defineFlow(
  {
    name: 'generateMessageFlow',
    inputSchema: GenerateMessageInputSchema,
    outputSchema: GenerateMessageOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);