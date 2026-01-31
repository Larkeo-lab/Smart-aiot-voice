import { z } from "zod";

export const audioFileSchema = z.object({
  file: z.any().refine((file) => file !== undefined, {
    message: "Audio file is required",
  }),
});

export type AudioFileRequest = z.infer<typeof audioFileSchema>;
