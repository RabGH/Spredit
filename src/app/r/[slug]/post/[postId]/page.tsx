import CommentsSection from "@/components/commentComponents/CommentsSection";
import EditorOutput from "@/components/editorComponents/EditorOutput";
import PostVoteServer from "@/components/postComponents/post-vote/PostVoteServer";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { formatTimeToNow } from "@/lib/utils";
import { CachedPost } from "@/types/redis";
import { Post, User, Vote } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EditButton from "@/components/editorComponents/EditButton";

export const metadata = {
  title: "Spredit Editor",
  description: "Vote and post on Spredit!",
};

interface SubRedditPostPageProps {
  params: {
    postId: string;
    slug: string;
  };
}

interface PostPageProps {
  params: {
    id: string;
    authorId: string;
  };
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const SubRedditPostPage = async ({
  params,
}: SubRedditPostPageProps & PostPageProps) => {
  const cachedPost = (await redis.hgetall(
    `post:${params.postId}`
  )) as CachedPost;

  console.log("cachedPost:", cachedPost);

  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  if (!cachedPost) {
    post = await db.post.findFirst({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
        author: true,
      },
    });
  }

  if (!post && !cachedPost) return notFound();

  const session = await getAuthSession();
  const isAuthor = session?.user.id === post?.authorId ?? cachedPost.authorId;

  return (
    <div>
      <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
        <Suspense fallback={<PostVoteShell />}>
          {/* @ts-expect-error server component */}
          <PostVoteServer
            postId={post?.id ?? cachedPost.id}
            getData={async () => {
              return await db.post.findUnique({
                where: {
                  id: params.postId,
                },
                include: {
                  votes: true,
                },
              });
            }}
          />
        </Suspense>

        <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
          <p className="max-h-40 mt-1 truncate text-xs text-gray-500">
            Posted by u/{post?.author.username ?? cachedPost.authorUsername}{" "}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}{" "}
            •{" "}
            {post?.createdAt !== post?.updatedAt && (
              <span>
                Edited{" "}
                {post?.updatedAt && formatTimeToNow(new Date(post.updatedAt))}
              </span>
            )}
          </p>
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
              {post?.title ?? cachedPost.title}
            </h1>
            <EditButton
              subredditName={params.slug}
              postId={post?.id ?? cachedPost.id}
              isAuthor={isAuthor}
            />
          </div>
          <EditorOutput content={post?.content ?? cachedPost.content} />

          <Suspense
            fallback={
              <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            }
          >
            {/* @ts-expect-error Server Component */}
            <CommentsSection postId={post?.id ?? cachedPost.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

function PostVoteShell() {
  return (
    <div className="flex items-center flex-col pr-6 w-20">
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className="h-5 w-5 text-zinc-700" />
      </div>

      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>

      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className="h-5 w-5 text-zinc-700" />
      </div>
    </div>
  );
}

export default SubRedditPostPage;
