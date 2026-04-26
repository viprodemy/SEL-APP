'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a summary of a student's emotional check-in data.
 *
 * - generateStudentSummary -  Generates a personalized summary of a student's emotional well-being based on their check-in data.
 * - GenerateStudentSummaryInput - The input type for the generateStudentSummary function.
 * - GenerateStudentSummaryOutput - The return type for the generateStudentSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudentSummaryInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  emotionTrends: z.string().describe('A summary of the student\'s emotion trends over the past week.'),
  calmingTool: z.string().describe('The calming tool the student used most often.'),
  checkInCount: z.number().describe('The number of times the student has checked in this month.'),
  positiveEmotionPercentage: z.number().describe('The percentage of positive emotions recorded.'),
  neutralEmotionPercentage: z.number().describe('The percentage of neutral emotions recorded.'),
  negativeEmotionPercentage: z.number().describe('The percentage of negative emotions recorded.'),
});
export type GenerateStudentSummaryInput = z.infer<typeof GenerateStudentSummaryInputSchema>;

const GenerateStudentSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the student\'s emotional well-being.'),
});
export type GenerateStudentSummaryOutput = z.infer<typeof GenerateStudentSummaryOutputSchema>;

export async function generateStudentSummary(input: GenerateStudentSummaryInput): Promise<GenerateStudentSummaryOutput> {
  return generateStudentSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudentSummaryPrompt',
  input: {schema: GenerateStudentSummaryInputSchema},
  output: {schema: GenerateStudentSummaryOutputSchema},
  model: 'googleai/gemma-4-31b-it',
  prompt: `You are an AI assistant that summarizes student emotion data.

  Here is the student's name: {{studentName}}
  Here is a summary of their emotion trends over the past week: {{emotionTrends}}
  Here is the calming tool they used most often: {{calmingTool}}
  Here is the number of times they checked in this month: {{checkInCount}}
  Here is the percentage of positive emotions recorded: {{positiveEmotionPercentage}}%
  Here is the percentage of neutral emotions recorded: {{neutralEmotionPercentage}}%
  Here is the percentage of negative emotions recorded: {{negativeEmotionPercentage}}%

  Based on this information, generate a short, one-paragraph summary of the student's emotional well-being, and suggest areas for improvement. Be positive and encouraging.
  `,
});

const generateStudentSummaryFlow = ai.defineFlow(
  {
    name: 'generateStudentSummaryFlow',
    inputSchema: GenerateStudentSummaryInputSchema,
    outputSchema: GenerateStudentSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
