import { z } from 'zod';

export const graphDataSchema = z.object({
  resultId: z.number(),
  nodes: z.array(z.object({ id: z.number(), label: z.string(), title: z.string() })),
  edges: z.array(z.object({ from: z.number(), to: z.number(), width: z.number() })),
});

export type GraphDataSchema = z.infer<typeof graphDataSchema>; 