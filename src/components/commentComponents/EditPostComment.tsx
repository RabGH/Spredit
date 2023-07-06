"use client";

import { FC, useRef, useCallback, useEffect, useState } from "react";
import { Label } from "../ui/Label";
import { Button } from "../ui/Button";
import { useMutation } from "@tanstack/react-query";
import {
  EditCommentRequest,
  EditCommentValidator,
} from "@/lib/validators/edit-comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";
import type EditorJS from "@editorjs/editorjs";
import { uploadFiles } from "@/lib/uploadthing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jsonToOutputData } from "@/lib/json-to-output-data";
import { Comment } from "@prisma/client";
import { MessageSquare } from "lucide-react";

interface EditCommentProps {
  comment?: Comment | null;
  commentId: string | undefined;
  isAuthor?: boolean;
}

const EditComment: FC<EditCommentProps> = ({
  comment,
  commentId,
  isAuthor,
}) => {
  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditCommentRequest>({
    resolver: zodResolver(EditCommentValidator),
    defaultValues: {
      commentId,
      text: null,
    },
  });

  const ref = useRef<EditorJS>();
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Edit Comment here...",
        inlineToolbar: true,
        data: jsonToOutputData(comment?.text as any),
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const [res] = await uploadFiles([file], "imageUploader");

                  return {
                    success: 1,
                    file: {
                      url: res.fileUrl,
                    },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
    setIsEditing(true);
  }, []);

  useEffect(() => {
    if (comment) {
      reset({
        text: comment.text,
      });
    }
  }, [comment, reset]);

  const { mutate: updateComment, isLoading } = useMutation({
    mutationFn: async ({ commentId, text }: EditCommentRequest) => {
      const payload: EditCommentRequest = {
        commentId,
        text,
      };

      const { data } = await axios.patch(`/api/subreddit/post/comment/edit`, {
        commentId,
        ...payload,
      });
      return data;
    },
    onError: (err: any) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem.",
        description: "Your comment was not updated, please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      ref.current?.clear();
      router.refresh();

      return toast({
        description: "Your comment has been edited.",
      });
    },
  });

  async function onSubmit(data: EditCommentRequest) {
    const blocks = await ref.current?.save();

    if (comment?.id === undefined) {
      return;
    }

    const payload: EditCommentRequest = {
      commentId,
      text: blocks,
    };

    router.refresh();
    updateComment(payload);
  }

  return (
    <div className="grid w-full gap-1.5">
      {isAuthor && isEditing && (
        <form
          id="subreddit-comment-form"
          className="w-fit"
          onSubmit={(event) => {
            handleSubmit(onSubmit)(event);
          }}
        >
          <Label htmlFor="comment">Edit your comment</Label>
          <div className="mt-2">
            <div
              id="editor"
              className="min-h-[100px] border border-gray-500/50 rounded-lg hover:opacity-100 transition-opacity duration-300 px-8 py-2"
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="ghost"
                size="xs"
                aria-label="edit"
                isLoading={isLoading}
                onClick={() => setIsEditing(true)}
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditComment;
