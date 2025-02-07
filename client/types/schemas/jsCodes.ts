import { z } from 'zod';

export const jsCodesSchema = z.object({
    function: z.string(),
    description: z.string()
});

export type jsCodesSchema = z.infer<typeof jsCodesSchema>; 