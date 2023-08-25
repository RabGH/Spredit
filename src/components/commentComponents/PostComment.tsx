import { FC, useCallback, useRef, useState } from "react";
import { UserAvatar } from "@/components/userComponents/UserAvatar";
import { Comment, CommentVote, User } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "@/components/commentComponents/CommentVotes";
import { Button } from "@/components/ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import EditorOutput from "@/components/editorComponents/EditorOutput";
import CreateSubComment from "@/components/commentComponents/postComment/CreateSubComment";
import EditComment from "@/components/commentComponents/postComment/EditComment";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  postId: string;
  onReply?: (commentId: string) => void;
  onEdit?: (commentId: string, replyToId: string) => void;
  openEditorCommentId: string | null;
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  votesAmt,
  currentVote,
  postId,
  onReply,
  onEdit,
  openEditorCommentId,
}) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const isAuthor = session?.user?.id === comment.author.id;

  const handleReplyComment = () => {
    if (!session) return router.push("/sign-in");
    setIsReplying(true);
    setIsEditing(false);
    onReply && onReply(comment.id);
  };

  const handleEditComment = useCallback(() => {
    setIsEditing(true);
    setIsReplying(false);
    onEdit && onEdit(comment.id, comment.replyToId ?? comment.id);
  }, [comment.id, comment.replyToId, onEdit]);

  return (
    <div ref={commentRef} className={`flex flex-col`}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <EditorOutput content={comment.text} />
      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote}
        />

        <Button
          onClick={() => {
            if (!session) return router.push("/sign-in");
            handleReplyComment();
          }}
          variant="ghost"
          size="xs"
          aria-label="reply"
          disabled={
            openEditorCommentId !== null && openEditorCommentId !== comment.id
          }
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>

        {isAuthor && (
          <Button
            onClick={handleEditComment}
            variant="ghost"
            size="xs"
            aria-label="edit"
            disabled={
              openEditorCommentId !== null && openEditorCommentId !== comment.id
            }
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
        )}

        {isReplying && onReply ? (
          <CreateSubComment
            postId={postId}
            replyToId={comment.replyToId ?? comment.id}
          />
        ) : null}

        {isEditing && onEdit ? (
          <EditComment comment={comment} commentId={comment.id} />
        ) : null}
      </div>
    </div>
  );
};

export default PostComment;
