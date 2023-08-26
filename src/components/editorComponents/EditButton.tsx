import { FC } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

interface EditButtonProps {
  subredditName: string;
  postId?: string;
  isAuthor?: boolean;
}

const EditButton: FC<EditButtonProps> = ({
  subredditName,
  postId,
  isAuthor,
}) => {
  return (
    <>
      {isAuthor && (
        <Link
          href={`/r/${subredditName}/post/${postId}/edit`}
          className={buttonVariants({
            variant: "outline",
            className: "mt-2",
          })}
        >
          Edit
        </Link>
      )}
    </>
  );
};

export default EditButton;
