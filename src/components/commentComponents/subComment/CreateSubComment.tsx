"use client";

import { FC, useRef, useCallback, useEffect, useState } from "react";
import { Label } from "../../ui/Label";
import { Button } from "../../ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";
import type EditorJS from "@editorjs/editorjs";
import { uploadFiles } from "@/lib/uploadthing";

interface CreateSubCommentProps {
  postId: string;
  replyToId?: string;
  onCancelReply?: () => void;
  isReplying: boolean;
}

const CreateSubComment: FC<CreateSubCommentProps> = ({ postId, replyToId }) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const ref = useRef<EditorJS>();

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
        placeholder: "What are your thoughts?",
        inlineToolbar: true,
        data: {
          blocks: [],
        },
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
    initializeEditor();
    return () => {
      ref.current?.destroy();
      ref.current = undefined;
    };
  }, [initializeEditor]);

  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment`,
        payload
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
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      ref.current?.clear();
      router.refresh();
      window.location.reload();
      return toast({
        description: "Your sub-comment has been posted.",
      });
    },
  });

  async function onSubmit() {
    const blocks = await ref.current?.save();

    const payload: CommentRequest = {
      postId,
      text: blocks,
      replyToId,
    };

    await comment(payload);
    router.refresh();
    onCancel();
  }

  const onCancel = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment</Label>
      <div className="mt-2">
        <div
          id="editor"
          className="min-h-[100px] border border-gray-500/50 rounded-lg hover:opacity-100 transition-opacity duration-300 px-8 py-2"
        />
        <div className="mt-2 flex justify-end">
          <Button isLoading={isLoading} onClick={onSubmit} className="mr-2">
            Post
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSubComment;
