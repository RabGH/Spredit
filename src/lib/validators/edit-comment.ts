import { z } from "zod";

export const EditCommentValidator = z.object({
  commentId: z.any(),
  text: z.any(),
  replyToId: z.string().optional(),
});

export type EditCommentRequest = z.infer<typeof EditCommentValidator>;
