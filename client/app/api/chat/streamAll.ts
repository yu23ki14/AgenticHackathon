import { openai } from "@ai-sdk/openai";
import llmClassifyQuery from "./llmClassifyQuery";
import { generateObject, LanguageModelV1, streamText, tool, ToolChoice } from "ai";
import { z } from "zod";
import { distributionsSchema } from "@/types/schemas/distributions";
import { jsCodesSchema } from "@/types/schemas/jsCodes";
import { newJsCodePrompt } from "@/prompts/newJsCodePrompts";

export default async function streamAll(messages: any) {
  const classification = await llmClassifyQuery(messages);

  // const gaianet = createOpenAI({
  //   baseURL: process.env.GAIANET_API_BASE_URL ?? '',       // 例: "https://llama8b.gaia.domains/v1"
  //   apiKey: process.env.GAIANET_API_KEY ?? '',             // Gaianetから取得したAPIキー
  //   compatibility: 'compatible',                           // OpenAI互換モード（3rdパーティ向け設定）
  // });

  // const result = streamText({
  //   model: gaianet('llama-3.2-3b'),  // 利用するGaianetモデルIDを指定（この例ではLlama 8bモデル）
  //   messages,                      // ユーザからのメッセージ履歴
  //   // 必要に応じて onFinish や他の設定も指定可能
  // });

  const javascriptCodingTool = {
    javascriptCoding: tool({
      description: 'related javascript code',
      parameters: z.object({}),
      execute: async () => {
        console.log("JavaScript coding tool called");
        const code = await generateObject({
          model: openai('gpt-4o'),
          system: newJsCodePrompt(10),
          messages: messages,
          schema: jsCodesSchema,
        });
        return {
          code: code.object,
        };
      },
    }),
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const distributionListTool = {
    distributionList: tool({
      description: 'related distribution list',
      parameters: z.object({}),
      execute: async () => {
        console.log("Distribution list tool called");
        const list = await generateObject({
          model: openai('gpt-4o-mini'),
          system: 'Write distribution list.',
          messages: messages,
          schema: distributionsSchema,
        });
        console.log("list.object: ", list.object);
        return {
          list: list.object,
        };
      },
    }),
  }

  let model: LanguageModelV1;
  let system: string | undefined;
  let tools: any;
  let toolChoice: string;

  if (classification.type === 'code_writing') {
    console.log("code writing mode activated");
    model = openai('gpt-4o');
    system = 'You are a coding assistant. If you decide to use the javascriptCoding tool, please provide the result (wrapped in a "result" key) in your response.';
    tools = javascriptCodingTool;
    toolChoice = 'required';
  // } else if (classification.type === 'distribution_list') {
  //   console.log("distribution list mode activated");
  //   model = openai('gpt-4o-mini');
  //   system = 'Just respond "Tool called".';
  //   tools = javascriptCodingTool;
  //   toolChoice = 'required';
  } else {
    console.log("general chat mode activated");
    model = openai('gpt-4o-mini');
    system = 'You are an expert customer service agent handling general inquiries.';
    tools = javascriptCodingTool;
    toolChoice = "none";
  }

  // Route based on classification
  // Set model and system prompt based on query type and complexity
  const result = streamText({
    model: model,
    system: system,
    messages: messages,
    tools: tools,
    toolChoice: toolChoice as ToolChoice<any>,
  });

  return result;
}
