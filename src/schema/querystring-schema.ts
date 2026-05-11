import z from "zod";

export const querystringSchema = z.object({
   skip: z.string().optional(),
   search: z.string().optional(),
   page: z.number().optional().default(1),
})