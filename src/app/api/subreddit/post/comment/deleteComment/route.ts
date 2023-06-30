import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { CommentValidator } from "@/lib/validators/comment";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, text, replyToId } = CommentValidator.parse(body);

    const session = await getAuthSession();

    if (!comment) {
        return new Response("Comment not found", { status: 404 });
      }

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if the comment belongs to the user
    const comment = await db.comment.findUnique({
      where: {
      },
    });

    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    await redis.del(`comment:${comment.id}`);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }

    return new Response("Could not delete comment.", {
      status: 500,
    });
  }
}
