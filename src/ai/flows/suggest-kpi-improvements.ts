// use server'
'use server';

/**
 * @fileOverview Provides AI-driven suggestions to improve revenue KPIs for a dental practice.
 *
 * - suggestKPIImprovements -  A function that returns suggestions on how to improve revenue KPIs.
 * - SuggestKPIImprovementsInput - The input type for the suggestKPIImprovements function.
 * - SuggestKPIImprovementsOutput - The return type for the suggestKPIImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestKPIImprovementsInputSchema = z.object({
  currentRevenue: z
    .number()
    .describe('The current monthly revenue of the dental practice.'),
  patientCount: z
    .number()
    .describe('The total number of patients served in the month.'),
  newPatientAcquisitionCost: z
    .number()
    .describe('The average cost to acquire a new patient.'),
  marketingSpend: z.number().describe('The total marketing spend for the month.'),
});
export type SuggestKPIImprovementsInput = z.infer<
  typeof SuggestKPIImprovementsInputSchema
>;

const SuggestKPIImprovementsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of suggestions to improve revenue KPIs. Empty array if no suggestions are applicable.'
    ),
});
export type SuggestKPIImprovementsOutput = z.infer<
  typeof SuggestKPIImprovementsOutputSchema
>;

export async function suggestKPIImprovements(
  input: SuggestKPIImprovementsInput
): Promise<SuggestKPIImprovementsOutput> {
  return suggestKPIImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestKPIImprovementsPrompt',
  input: {schema: SuggestKPIImprovementsInputSchema},
  output: {schema: SuggestKPIImprovementsOutputSchema},
  prompt: `You are an expert financial advisor for dental practices. Your goal is to provide actionable suggestions to improve their revenue KPIs.

  Consider the following metrics for the dental practice:

  Current Revenue: {{{currentRevenue}}}
  Patient Count: {{{patientCount}}}
  New Patient Acquisition Cost: {{{newPatientAcquisitionCost}}}
  Marketing Spend: {{{marketingSpend}}}

  Provide a list of suggestions to improve revenue KPIs. If no suggestions are applicable, return an empty list. Keep the suggestions concise and direct.
  `,
});

const suggestKPIImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestKPIImprovementsFlow',
    inputSchema: SuggestKPIImprovementsInputSchema,
    outputSchema: SuggestKPIImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
