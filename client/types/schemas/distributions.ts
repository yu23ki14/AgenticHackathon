import { z } from 'zod';
import { graphDataSchema } from './graphData';

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

export const distributionQuerySchema = z.object({
  totalBudget: z.number(),
  activeGraph: graphDataSchema,
});

export const distributionJsCodeSchema = z.object({
  result: z.array(
    z.object({
      function: z.string(),
      description: z.string(),
      reason: z.string(),
    })
  )
});

export type DistributionsSchema = z.infer<typeof distributionsSchema>; 
export type DistributionQuerySchema = z.infer<typeof distributionQuerySchema>; 
export type DistributionJsCodeSchema = z.infer<typeof distributionJsCodeSchema>; 