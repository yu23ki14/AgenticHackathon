// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { openai, createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // const gaiaProvider = createOpenAI({
  //   baseURL: process.env.GAIANET_API_BASE_URL ?? '',       // 例: "https://llama8b.gaia.domains/v1"
  //   apiKey: process.env.GAIANET_API_KEY ?? '',             // Gaianetから取得したAPIキー
  //   compatibility: 'compatible',                           // OpenAI互換モード（3rdパーティ向け設定）
  // });

  // const resultGaia = streamText({
  //   model: gaiaProvider('llama'),  // 利用するGaianetモデルIDを指定（この例ではLlama 8bモデル）
  //   messages,                      // ユーザからのメッセージ履歴
  //   // 必要に応じて onFinish や他の設定も指定可能
  // });

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
  });

  return result.toDataStreamResponse();
}