"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Comment, CommentVote, User } from "@prisma/client";
import PostComment from "./PostComment";
import CreatePostComment from "./CreatePostComment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
  replies: ReplyComment[];
  text: any;
};

type ReplyComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface CommentsSectionProps {
  postId: string;
  session: any;
}

const CommentsSection = ({ postId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<ExtendedComment[]>([]);
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isCommentSubmitted, setIsCommentSubmitted] = useState<boolean>(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleReply = () => {
    setIsReplying(true);
    setIsCommentSubmitted(false);
  };

  const handleCancelReply = () => {
    setIsReplying(false);
    setIsCommentSubmitted(false);
    router.refresh();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/posts/comments?postId=${postId}`
        );
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchData();
  }, [postId, comments]);

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      {isReplying ? null : (
        <CreatePostComment
          postId={postId}
          disabled={isReplying}
          onCancelReply={handleCancelReply}
          onCommentSubmit={() => setIsCommentSubmitted(true)}
        />
      )}

      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === "UP") return acc + 1;
                if (vote.type === "DOWN") return acc - 1;
                return acc;
              },
              0
            );

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user.id
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    comment={topLevelComment}
                    votesAmt={topLevelCommentVotesAmt}
                    currentVote={topLevelCommentVote}
                    postId={postId}
                    onReply={handleReply}
                  />
                </div>
                <div className="ml-6">
                  {topLevelComment.replies.map((replyComment) => (
                    <div key={replyComment.id} className="flex flex-col">
                      <div className="mb-2">
                        <PostComment
                          comment={replyComment}
                          votesAmt={replyComment.votes.reduce((acc, vote) => {
                            if (vote.type === "UP") return acc + 1;
                            if (vote.type === "DOWN") return acc - 1;
                            return acc;
                          }, 0)}
                          currentVote={replyComment.votes.find(
                            (vote) => vote.userId === session?.user.id
                          )}
                          postId={postId}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSection;
