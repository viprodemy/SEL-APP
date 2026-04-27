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
    temperature: 0.7, 
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
  prompt: `You are an expert Social-Emotional Learning (SEL) consultant for teachers.
A student named {{studentName}} has completed an emotional check-in.
Your task is to generate a high-quality, professional report for their teacher that provides deep insight and clear action items.

### STUDENT DATA:
- Initial Emotion: {{emotion}} (Intensity: {{intensity}}/10)
- Student's Context: "{{description}}"
- Physical Sensations: {{#each bodyScan}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Stated Need: "{{needs.need}}"
- Stated Hope: "{{needs.hope}}"
- Self-Care Plan: "{{needs.selfCare}}"
{{#if postCoolDownEmotion}}
- Post Cool-Down: {{postCoolDownEmotion}} (Intensity: {{postCoolDownIntensity}}/10)
{{/if}}

### YOUR TASK:
Write a one-paragraph report in both English and Chinese. 
Do NOT be generic. Use the "Student's Context" and "Stated Hope" to give the teacher a real "aha!" moment about why the student is feeling this way.

1. **Analytical Insight**: Why is {{studentName}} feeling {{emotion}}? Link it to their context. (e.g., "The intensity suggests they feel a significant lack of control over...")
2. **Actionable Growth**: How can the teacher fulfill the "Stated Hope"? Give a specific 1-min action the teacher can take today.
3. **Observation**: If there was a cool-down, did it help? What does that tell the teacher about {{studentName}}'s self-regulation?
4. **Tone**: Supportive, professional, and observant.

**IMPORTANT**: Provide the report in both English and Chinese. Separate the languages with a newline.
Example: "English paragraph analyzing the specific context and giving a clear tip.\n中文段落，深入分析学生情况并提供具体建议。"`,
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
