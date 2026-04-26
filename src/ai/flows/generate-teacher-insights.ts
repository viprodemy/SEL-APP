'use server';

/**
 * @fileOverview A Genkit flow that generates insights for teachers based on class emotional check-in data.
 *
 * - generateTeacherInsights - A function that generates insights for teachers.
 * - GenerateTeacherInsightsInput - The input type for the generateTeacherInsights function.
 * - GenerateTeacherInsightsOutput - The return type for the generateTeacherInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTeacherInsightsInputSchema = z.object({
  classMoodHeatmap: z
    .string()
    .describe('A string representing the class mood heatmap data.'),
  top3Triggers: z
    .string()
    .describe(
      'A string representing the top 3 triggers affecting the class emotions.'
    ),
  studentsNeedingCheckIn: z
    .string()
    .describe('A string representing the list of students needing check-in.'),
});
export type GenerateTeacherInsightsInput = z.infer<
  typeof GenerateTeacherInsightsInputSchema
>;

const GenerateTeacherInsightsOutputSchema = z.object({
  insights: z.string().describe('The generated insights for the teacher.'),
});
export type GenerateTeacherInsightsOutput = z.infer<
  typeof GenerateTeacherInsightsOutputSchema
>;

export async function generateTeacherInsights(
  input: GenerateTeacherInsightsInput
): Promise<GenerateTeacherInsightsOutput> {
  return generateTeacherInsightsFlow(input);
}

const generateTeacherInsightsPrompt = ai.definePrompt({
  name: 'generateTeacherInsightsPrompt',
  input: {schema: GenerateTeacherInsightsInputSchema},
  output: {schema: GenerateTeacherInsightsOutputSchema},
  model: 'googleai/gemma-4-31b-it',
  prompt: `You are an AI assistant helping teachers understand their students' emotional states.
  Based on the following data, generate insights for the teacher to understand common stressors and tailor SEL activities accordingly.

  Class Mood Heatmap: {{{classMoodHeatmap}}}
  Top 3 Triggers: {{{top3Triggers}}}
  Students Needing Check-In: {{{studentsNeedingCheckIn}}}

  Provide a concise summary of the key insights from the data.`,
});

const generateTeacherInsightsFlow = ai.defineFlow(
  {
    name: 'generateTeacherInsightsFlow',
    inputSchema: GenerateTeacherInsightsInputSchema,
    outputSchema: GenerateTeacherInsightsOutputSchema,
  },
  async input => {
    const {output} = await generateTeacherInsightsPrompt(input);
    return output!;
  }
);
