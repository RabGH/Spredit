import { FC } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

interface EditButtonProps {
  subredditName: string;
  postId: string;
}

const EditButton: FC<EditButtonProps> = ({ subredditName, postId }) => {
  return (
    <Link
      href={`/r/${subredditName}/post/${postId}/edit`}
      className={buttonVariants({
        variant: "outline",
        className: "px-4 py-2",
      })}
    >
      Edit
    </Link>
  );
};

export default EditButton;
