import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export default async function llmClassifyQuery(messages: any) {
  const classificationModel = openai('gpt-4o-mini');

  const { object: classification } = await generateObject({
    model: classificationModel,
    schema: z.object({
      type: z.enum(['general', 'code_writing', 'distribution_list']),
    }),
    prompt: `Classify this customer query:
    ${messages[messages.length - 1].content}

    Determine: Query type (general, code, or distribution list)`,
  });

  return classification;
}