'use server';
import { config } from 'dotenv';
config({ path: '.env.local' });
import './flows/generate-teacher-insights.ts';
import './flows/provide-emotion-reframing.ts';
import './flows/generate-student-summary.ts';
import './flows/speech-to-text.ts';
import './flows/generate-teacher-report.ts';
import './flows/analyze-emotional-state.ts';
