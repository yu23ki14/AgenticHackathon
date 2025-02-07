import { openai } from "@ai-sdk/openai";
import { generateText, streamText, tool } from "ai";
import { z } from "zod";

export default async function streamJsCodeWithTool(messages: any) {
  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    system: 'If you use tools, you should just respond "Tool called"',
    tools: {
      javascript: tool({
        description: 'related javascript code',
        parameters: z.object({}),
        execute: async () => {
          console.log("messages[messages.length - 1]: ", messages[messages.length - 1]);
          const code = await generateText({
            model: openai('gpt-4o-mini'),
            system: 'Write javascript code using one code block.',
            messages: messages,
          });
          console.log("code: ", code);
          return {
            code: code.text,
          };
        },
      }),
    },
  });

  return result;
}