import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";
import { getAuthSession } from "@/lib/auth";

const CustomFeed = async () => {
  const session = await getAuthSession();
  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subreddit: true,
    },
  });

  const allPosts = await db.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });

  const followedCommunityIds = followedCommunities.map(
    ({ subreddit }) => subreddit.id
  );

  const sortedPosts = allPosts.sort((a, b) => {
    if (
      followedCommunityIds.includes(a.subredditId) &&
      !followedCommunityIds.includes(b.subredditId)
    ) {
      return -1;
    } else if (
      !followedCommunityIds.includes(a.subredditId) &&
      followedCommunityIds.includes(b.subredditId)
    ) {
      return 1;
    } else {
      return 0;
    }
  });

  return <PostFeed initialPosts={sortedPosts} />;
};

export default CustomFeed;
