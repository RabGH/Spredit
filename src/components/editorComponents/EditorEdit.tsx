"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { EditPostRequest, EditPostValidator } from "@/lib/validators/edit-post";
import { zodResolver } from "@hookform/resolvers/zod";
import type EditorJS from "@editorjs/editorjs";
import { jsonToOutputData } from "@/lib/json-to-output-data";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { Post } from "@prisma/client";

interface EditorProps {
  post?: Post | null;
  postId: string | undefined;
}

const EditorEdit: FC<EditorProps> = ({ post, postId }) => {
  const {
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditPostRequest>({
    resolver: zodResolver(EditPostValidator),
    defaultValues: {
      postId,
      title: "",
      content: null,
    },
  });

  const ref = useRef<EditorJS>();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const _titleRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const router = useRouter();

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
        placeholder: "Type here to write your post...",
        inlineToolbar: true,

        data: jsonToOutputData(post?.content as any),
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
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      console.log(errors);
      for (const [_key, value] of Object.entries(errors)) {
        toast({
          title: "Something went wrong.",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();

      setTimeout(() => {
        _titleRef.current?.focus();
      }, 0);
    };

    if (isMounted) {
      init();
      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        content: post.content,
      });
    }
  }, [post, reset]);

  const { mutate: updatePost } = useMutation({
    mutationFn: async ({
      postId,
      title,
      content,
    }: {
      postId?: any;
      title: string;
      content?: any;
    }) => {
      const payload = { title, content };
      const { data } = await axios.patch(`/api/subreddit/post/edit`, {
        postId,
        ...payload,
      });
      return data;
    },
    onError: () => {
      return toast({
        title: "Something went wrong.",
        description: "Your post was not updated, please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      const newPathname = pathname.split("/").slice(0, -1).join("/");
      router.push(newPathname);

      router.refresh();

      return toast({
        description: "Your post was successfully updated.",
      });
    },
  });

  async function onSubmit(data: EditPostRequest) {
    console.log("onSubmit data:", data);

    const blocks = await ref.current?.save();

    if (post?.id === undefined) {
      console.log("post.id is undefined");
      return;
    }

    const payload: EditPostRequest = {
      postId: post.id,
      title: data.title,
      content: blocks as any,
    };

    console.log("onSubmit payload:", payload);

    updatePost(payload);
  }
  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form
        id="subreddit-post-form"
        className="w-fit"
        onSubmit={(event) => {
          console.log("handleSubmit event:", event);
          console.log("postId:", postId);
          handleSubmit(onSubmit)(event);
        }}
      >
        <input type="hidden" name="postId" value={postId} />
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            name="title"
            ref={_titleRef}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
            defaultValue={post?.title}
          />

          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
    </div>
  );
};
export default EditorEdit;
