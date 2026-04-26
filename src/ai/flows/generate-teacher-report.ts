'use server';

/**
 * @fileOverview Generates a report for a teacher based on a student's emotional check-in.
 *
 * - generateTeacherReport - A function that generates the report.
 * - GenerateTeacherReportInput - The input type for the function.
 * - GenerateTeacherReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTeacherReportInputSchema = z.object({
  studentName: z.string().describe("The student's name."),
  emotion: z.string().describe('The emotion the student felt.'),
  intensity: z.number().describe('The intensity of the emotion from 0-10.'),
  description: z.string().describe("The student's description of what happened."),
  bodyScan: z.array(z.string()).describe("Body parts where the student felt sensations."),
  needs: z.object({
    need: z.string().describe("What the student needs."),
    hope: z.string().describe("What the student hopes others will do."),
    selfCare: z.string().describe("How the student can take care of themself."),
  }),
  postCoolDownEmotion: z.string().optional().describe("The student's emotion after the cool-down exercise."),
  postCoolDownIntensity: z.number().optional().describe("The intensity of the emotion after the cool-down exercise."),
});
export type GenerateTeacherReportInput = z.infer<typeof GenerateTeacherReportInputSchema>;

const GenerateTeacherReportOutputSchema = z.object({
  report: z.string().describe('A paragraph for the teacher suggesting how to help or praise the student, in both English and Chinese, separated by a newline.'),
});
export type GenerateTeacherReportOutput = z.infer<typeof GenerateTeacherReportOutputSchema>;

export async function generateTeacherReport(input: GenerateTeacherReportInput): Promise<GenerateTeacherReportOutput> {
  return generateTeacherReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTeacherReportPrompt',
  input: {schema: GenerateTeacherReportInputSchema},
  output: {schema: GenerateTeacherReportOutputSchema},
  model: 'googleai/gemma-4-31b-it',
  config: {
    temperature: 0.5, // 报告需要一定的准确性，0.5 比较平衡
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
  prompt: `You are an AI assistant for teachers, skilled in social-emotional learning.
A student named {{studentName}} just completed an emotional check-in.
Your task is to generate a short, constructive paragraph for their teacher, in both English and Chinese.

Here is the data from the check-in:
- Initial Emotion: {{emotion}} (Intensity: {{intensity}}/10)
- Student's Description: "{{description}}"
- Body Sensations Felt In: {{#each bodyScan}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Stated Need: "{{needs.need}}"
- Stated Hope: "{{needs.hope}}"
- Self-Care Plan: "{{needs.selfCare}}"
{{#if postCoolDownEmotion}}
- After Cool-Down Emotion: {{postCoolDownEmotion}} (Intensity: {{postCoolDownIntensity}}/10)
{{/if}}

Based on all this information, write a one-paragraph report for the teacher.
- If the initial emotion is positive (e.g., Happy, Proud), focus on specific praise. What specific action or insight can the teacher acknowledge?
- If the initial emotion is negative (e.g., Sad, Angry, Worried) and the intensity is high (7 or above), emphasize the urgency and provide clear, simple steps for support. How can the teacher help the student with their stated need and hope immediately?
- If the emotion is negative but the intensity is lower, provide supportive suggestions.
- If there was a cool-down step, comment on the change (or lack of change) in emotion. For example, "It's a positive sign that they felt calmer after the exercise" or "They still felt worried after the exercise, suggesting the issue may need more attention."
- Keep the tone positive and action-oriented. Start by acknowledging the student's self-awareness.
- Address the teacher directly. For example, "You can praise {{studentName}} for..." or "You could support {{studentName}} by...".
- Be concise and focus on the most important action the teacher can take.

**IMPORTANT**: Provide the report in both English and Chinese. Separate the two languages with a newline character. For example: "English paragraph.\n中文段落。"`,
});

const generateTeacherReportFlow = ai.defineFlow(
  {
    name: 'generateTeacherReportFlow',
    inputSchema: GenerateTeacherReportInputSchema,
    outputSchema: GenerateTeacherReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
