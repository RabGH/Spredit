"use client";

import { FC, useRef, useCallback, useEffect, useState } from "react";
import { Label } from "../../ui/Label";
import { Button } from "../../ui/Button";
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

interface EditCommentProps {
  comment?: Comment | null;
  commentId: string | undefined;
}

const EditComment: FC<EditCommentProps> = ({ comment, commentId }) => {
  const { reset } = useForm<EditCommentRequest>({
    resolver: zodResolver(EditCommentValidator),
    defaultValues: {
      commentId,
      text: null,
    },
  });

  const { loginToast } = useCustomToast();
  const router = useRouter();
  const ref = useRef<EditorJS>();
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(true);

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
  }, []);

  useEffect(() => {
    if (comment) {
      reset({
        text: comment.text,
      });
    }
  }, [comment, reset]);

  useEffect(() => {
    initializeEditor();
    return () => {
      ref.current?.destroy();
      ref.current = undefined;
    };
  }, [initializeEditor]);

  const { mutate: updateComment, isLoading } = useMutation({
    mutationFn: async ({ commentId, text }: EditCommentRequest) => {
      const payload: EditCommentRequest = {
        commentId,
        text,
      };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment/editComment`,
        {
          commentId,
          ...payload,
        }
      );
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
      window.location.reload();
      return toast({
        description: "Your comment has been edited.",
      });
    },
  });

  const onSubmit = async () => {
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
  };

  const onCancel = useCallback(() => {
    setIsEditorOpen(false);
    window.location.reload();
  }, []);

  return (
    <div className="grid w-full gap-1.5">
      {isEditorOpen && (
        <div className="w-full">
          <Label htmlFor="comment">Edit your post-comment</Label>
          <div className="mt-2">
            <div
              id="editor-container"
              className="min-h-[100px] border border-gray-500/50 rounded-lg hover:opacity-100 transition-opacity duration-300 px-8 py-2"
            >
              <div id="editor" className="min-h-[100px]" />
            </div>

            <div className="mt-2 flex justify-end">
              <Button isLoading={isLoading} onClick={onSubmit} className="mr-2">
                Edit
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditComment;
