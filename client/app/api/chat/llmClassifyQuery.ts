import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export default async function llmClassifyQuery(messages: any) {
  const classificationModel = openai('gpt-4o-mini');

  const { object: classification } = await generateObject({
    model: classificationModel,
    schema: z.object({
      type: z.enum(['general', 'code_writing']),
    }),
    prompt: `
    Context:
    ${messages.slice(0, -1).map((m: any) => m.content).join('\n')}

    Classify this customer query:
    ${messages[messages.length - 1].content}

    Determine: Query type (general, code)
    
    Rules:
    - Classify as "code_writing" ONLY when the query explicitly requests:
      - Writing new code from scratch
      - Direct modifications to existing code
      - Adding new features or functionality through code
    - Classify as "general" for:
      - Questions about code or programming concepts
      - Code explanation requests
      - Code review discussions
      - Best practices inquiries
      - Debugging help
      - Understanding existing code
      - Discussions about coding approaches
      - Questions about evaluation methods
    `,
  });

  return classification;
}