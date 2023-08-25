import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { EditCommentValidator } from "@/lib/validators/edit-comment";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    console.log(body);

    const { text, replyToId } = EditCommentValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // const comment = await db.post.findUnique({
    //   where: { id: commentId },
    // });
    // if (!comment || comment.authorId !== session.user.id) {
    //   return new Response("Forbidden", { status: 403 });
    // }

    await db.comment.update({
      where: { id: replyToId },
      data: {
        text: text,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid PATCH request data passed", {
        status: 422,
      });
    }

    return new Response(
      "Could not update sub-comment at this time, please try again later",
      { status: 500 }
    );
  }
}