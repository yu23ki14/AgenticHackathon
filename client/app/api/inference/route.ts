// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { distributionJsCodeSchema } from '@/types/schemas/distributions';
import { openai } from '@ai-sdk/openai';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { generateObject, streamObject } from 'ai';

export async function POST(req: Request) {
  const context = await req.json();
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

  const model = openai('gpt-4o-mini');
  const system = `
You are a helpful assistant that generates reward distribution patterns in the form of a JavaScript function based on dependency graph data.

Input Data:
Total Budget:  USDC
Distribution Concept: weighted
Dependency Graph Data:

Please generate three distribution patterns as a JSON array. Each element in the array should be an object with the following properties:
- function: string (a complete JavaScript function that performs an update on transactions, nodeMap, and edgeMap; for example, a function that iterates over transactions and adjusts node sizes and edge widths)
- description: string (a brief description of the pattern)
- reason: string (explain why this pattern was chosen)

Return only valid JSON.
`;

  const result = await generateObject({
    model,
    schema: distributionJsCodeSchema,
    system,
    prompt: context,
  });

  return result.toJsonResponse();
}