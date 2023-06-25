import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { EditPostValidator } from "@/lib/validators/edit-post";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    console.log(body);

    const { postId, title, content } = EditPostValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if the user is authorized to edit the post
    const post = await db.post.findUnique({
      where: { id: postId },
    });
    if (!post || post.authorId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    await db.post.update({
      where: { id: postId },
      data: {
        title,
        content,
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
      "Could not update post at this time, please try again later",
      { status: 500 }
    );
  }
}
