// eslint-disable-next-line @typescript-eslint/no-unused-vars
import streamAll from './streamAll';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = await streamAll(messages);
  
  return result.toDataStreamResponse();
}