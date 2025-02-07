import { z } from 'zod';

export const distributionsSchema = z.object({
  distributions: z.array(
    z.object({
      resultId: z.number(),
      distributionData: z.array(
        z.object({
          name: z.string(),
          value: z.number()
        })
      )
    })
  )
});

export type DistributionsSchema = z.infer<typeof distributionsSchema>; 