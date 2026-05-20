import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import * as Sentry from '@sentry/nextjs';

// Verifica se a chave de API está presente no ambiente
if (typeof window === 'undefined' && !process.env.GEMINI_API_KEY) {
  Sentry.captureException(new Error('Genkit initialization error'));
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
