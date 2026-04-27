
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
  prompt: `You are an AI assistant who creates a short, highly personalized, positive self-affirmation statement for a student. 
It should be something they can read to themselves to shift their perspective and feel empowered.

Emotion: {{{emotion}}}
Situation: {{{description}}}

### YOUR TASK:
Based on the specific emotion and situation, generate a personalized, first-person reframing statement in both English and Chinese. 
It must be in the first person ("I am...", "My feelings...").

CRITICAL: 
- DO NOT use generic phrases like "I am strong". 
- INSTEAD, connect the strength to the situation. 
- Example: If they are sad about a broken toy: "My sadness shows how much I value my things. I can take this care and use it to fix it or treasure my other toys."
- Keep it concise (1-2 sentences).
- Frame the feeling as a strength, a sign of care, or a learning opportunity.

Generate the response in JSON:
{
  "reframingStatement": {
    "en": "...",
    "zh": "..."
  }
}
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
