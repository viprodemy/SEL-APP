
'use server';

/**
 * @fileOverview Provides a positive reframing statement for a selected emotion and situation in English and Chinese.
 *
 * - provideEmotionReframing - A function that returns a positive reframing statement for a given emotion and description.
 * - ProvideEmotionReframingInput - The input type for the provideEmotionReframing function.
 * - ProvideEmotionReframingOutput - The return type for the provideEmotionReframing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideEmotionReframingInputSchema = z.object({
  emotion: z
    .string()
    .describe('The emotion selected by the student.'),
  description: z
    .string()
    .describe("The student's description of what happened.")
});
export type ProvideEmotionReframingInput = z.infer<typeof ProvideEmotionReframingInputSchema>;

const ProvideEmotionReframingOutputSchema = z.object({
  reframingStatement: z.object({
    en: z.string().describe('Personalized positive reframing statement in English.'),
    zh: z.string().describe('Personalized positive reframing statement in Chinese.'),
  }).describe('The positive reframing statement in English and Chinese.'),
});

export type ProvideEmotionReframingOutput = z.infer<typeof ProvideEmotionReframingOutputSchema>;

export async function provideEmotionReframing(input: ProvideEmotionReframingInput): Promise<ProvideEmotionReframingOutput> {
  return provideEmotionReframingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideEmotionReframingPrompt',
  input: {schema: ProvideEmotionReframingInputSchema},
  output: {schema: ProvideEmotionReframingOutputSchema},
  model: 'googleai/gemma-4-31b-it',
  prompt: `You are an AI assistant who creates a short, positive self-affirmation statement for a student. It should be something they can read to themselves to feel better. It must be in the first person ("I am...", "My feelings..."). Respond in JSON.

Emotion: {{{emotion}}}
Situation: {{{description}}}

Based on the emotion and situation, generate a personalized, first-person reframing statement in both English and Chinese. Frame the feeling as a strength or a learning opportunity. Keep it concise.

Example:
If emotion is "Sad" and situation is "I failed my test", a good response would be:
EN: "My sadness about the test shows how much I care. This feeling can be my fuel for next time."
ZH: "这次考试的难过，正是我在乎的证明。这个感觉可以成为我下一次的动力。"

Generate the response now.
`,
});

const provideEmotionReframingFlow = ai.defineFlow(
  {
    name: 'provideEmotionReframingFlow',
    inputSchema: ProvideEmotionReframingInputSchema,
    outputSchema: ProvideEmotionReframingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
