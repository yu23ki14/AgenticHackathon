// eslint-disable-next-line @typescript-eslint/no-unused-vars
import streamAll from './streamAll';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;



export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamAll(messages);
  
  return result.toDataStreamResponse();
}