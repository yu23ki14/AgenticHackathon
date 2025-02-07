import { openai } from "@ai-sdk/openai";
import llmClassifyQuery from "./llmClassifyQuery";
import { LanguageModelV1, streamText } from "ai";

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

  let model: LanguageModelV1;
  let system: string | undefined;

  if (classification.type === 'code_writing') {
    console.log("code writing mode activated");
    model = openai('gpt-4o-mini');
    system = 'Write javascript code using one code block.';
  } else {
    console.log("general chat mode activated");
    model = openai('gpt-4o-mini');
    system = 'You are an expert customer service agent handling general inquiries.';
  }

  // Route based on classification
  // Set model and system prompt based on query type and complexity
  const result = streamText({
    model: model,
    system: system,
    messages: messages,
  });

  return result;
}