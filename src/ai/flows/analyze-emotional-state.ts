'use server';
/**
 * @fileOverview An AI flow that analyzes a student's emotional state and provides supportive guidance for the student, teachers, and parents.
 *
 * - analyzeEmotionalState - Analyzes student's emotion, description, and needs to provide suggestions.
 * - AnalyzeEmotionalStateInput - The input type for the function.
 * - AnalyzeEmotionalStateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeEmotionalStateInputSchema = z.object({
  emotion: z.string().describe("The primary emotion the student has identified."),
  description: z.string().describe("The student's description of what happened."),
  needs: z
    .object({
      need: z.string().describe('What the student says they need.'),
      hope: z.string().describe('What the student hopes others will do.'),
      selfCare: z.string().describe('How the student plans to take care of themself.'),
    })
    .describe("The student's stated needs, hopes, and self-care plan."),
});

const AnalyzeEmotionalStateOutputSchema = z.object({
  understanding: z.object({
      en: z.string().describe("An empathetic acknowledgment of the student's feelings in English."),
      zh: z.string().describe("An empathetic acknowledgment of the student's feelings in Chinese."),
  }),
  suggestions: z.array(z.object({
      en: z.string().describe("An actionable suggestion for the student in English."),
      zh: z.string().describe("An actionable suggestion for the student in Chinese."),
  })).describe("A list of 2-3 simple, actionable suggestions for the student."),
  emotionMeaning: z.object({
      en: z.string().describe("A brief, teacher-focused explanation of what this emotion typically signifies in English."),
      zh: z.string().describe("A brief, teacher-focused explanation of what this emotion typically signifies in Chinese."),
  }),
  stakeholderSuggestions: z.object({
      en: z.string().describe("Suggestions for teachers and parents in English."),
      zh: z.string().describe("Suggestions for teachers and parents in Chinese."),
  }),
});

export type AnalyzeEmotionalStateInput = z.infer<typeof AnalyzeEmotionalStateInputSchema>;
export type AnalyzeEmotionalStateOutput = z.infer<typeof AnalyzeEmotionalStateOutputSchema>;

export async function analyzeEmotionalState(input: AnalyzeEmotionalStateInput): Promise<AnalyzeEmotionalStateOutput> {
  return analyzeEmotionalStateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmotionalStatePrompt',
  input: { schema: AnalyzeEmotionalStateInputSchema },
  output: { schema: AnalyzeEmotionalStateOutputSchema },
  model: 'googleai/gemma-4-31b-it',
  prompt: `
    Role: You are an highly empathetic, professional school counselor AI specialized in Social-Emotional Learning (SEL). 
    Your goal is to help students understand their feelings and feel "heard".

    The student has provided the following context:
    - Current Emotion: {{emotion}}
    - Context/Situation: "{{description}}"
    - What they say they need: "{{needs.need}}"
    - What they hope others will do: "{{needs.hope}}"
    - Their own self-care plan: "{{needs.selfCare}}"

    ### YOUR TASK:
    Analyze this specific situation and respond in JSON. Provide all text in both English (en) and Chinese (zh).
    Avoid generic advice. Use the details from the "Context/Situation" and "Needs" to provide tailored support.

    1.  **Understanding**: Write a 2-3 sentence empathetic acknowledgment. 
        - Reference the student's specific situation from "{{description}}". 
        - Validate their feeling of "{{emotion}}" in this specific context.
        - Ensure they feel "seen" and "supported".

    2.  **Suggestions**: Provide 2-3 specific, actionable suggestions for the student based on their "{{needs.need}}" and situation.
        - If they need space, suggest how to find it. 
        - If they need to talk, suggest how to start that conversation.

    3.  **Emotion Meaning (For Teacher)**: Explain the "message" behind this specific emotion in this specific context. 
        - Don't just define the emotion; explain why the student might be feeling it given their description.

    4.  **Stakeholder Suggestions (For Teacher/Parent)**: Provide specific advice for teachers/parents to support this student's stated "{{needs.hope}}".
        - Example (en): "Teacher: Since the student hopes to talk after class, try to create a private 5-minute window for them."

    CRITICAL: Ensure the tone is warm, non-judgmental, and the content is directly linked to the student's words. Do not use generic placeholders.
  `,
});

const analyzeEmotionalStateFlow = ai.defineFlow(
  {
    name: 'analyzeEmotionalStateFlow',
    inputSchema: AnalyzeEmotionalStateInputSchema,
    outputSchema: AnalyzeEmotionalStateOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
