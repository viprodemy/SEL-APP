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
    Role: You are an empathetic and professional school counselor AI. Your analysis is for supportive and educational purposes in a safe environment. Do not refuse to analyze any emotion.

    The student has provided the following information:
    - Emotion: {{emotion}}
    - Description of events: "{{description}}"
    - What they need: "{{needs.need}}"
    - What they hope for: "{{needs.hope}}"
    - Their self-care plan: "{{needs.selfCare}}"

    Your Task: Analyze this information and respond in the required JSON format. Provide all text in both English (en) and Chinese (zh).

    1.  **Understanding**: Write a short, empathetic acknowledgment of the student's feelings.
        - Example (en): "It sounds like you felt really sad when that happened, and it's completely okay to feel that way."
        - Example (zh): "听起来当那件事发生时你真的很难过，有这种感觉是完全正常的。"

    2.  **Suggestions**: Provide 2-3 simple, actionable suggestions for the student.
        - Example (en): "Maybe you could try talking to a trusted adult about this."
        - Example (zh): "或许你可以试着和一位你信任的成年人谈谈这件事。"

    3.  **Emotion Meaning (For Teacher)**: Explain briefly what this emotion typically signifies.
        - Example (en): "Sadness often arises from a sense of loss. It signals that what was lost was important to the student."
        - Example (zh): "伤心通常源于失落感。它表明失去的东西对学生很重要。"

    4.  **Stakeholder Suggestions (For Teacher/Parent)**: Provide one concise suggestion for teachers and one for parents.
        - Example (en): "Teacher: You could check in with the student privately. Parent: You can create a safe space for them to share their feelings without judgment."
        - Example (zh): "老师：您可以私下与学生沟通。家长：您可以创造一个安全的空间，让他们无所顾忌地分享感受。"

    Now, generate the JSON output based on the student's input.
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
