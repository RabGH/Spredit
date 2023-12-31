import { z } from "zod";

export const EditPostValidator = z.object({
  postId: z.any(),
  content: z.any(),
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(128, { message: "Title must be shorter than 128 characters" }),
});

export type EditPostRequest = z.infer<typeof EditPostValidator>;
