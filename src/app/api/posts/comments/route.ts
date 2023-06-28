import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const { postId } = z
      .object({
        postId: z.string(),
      })
      .parse({
        postId: url.searchParams.get("postId"),
      });

    const session = await getAuthSession();

    const comments = await db.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        author: true,
        votes: true,
        replyTo: true,
        replies: {
          include: {
            author: true,
            votes: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(comments));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }

    return new Response("Could not fetch comments.", {
      status: 500,
    });
  }
}
