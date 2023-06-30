import { Vote, Post, Comment } from "@prisma/client";

export type CachedPost = {
  id: string;
  title: string;
  authorUsername: string;
  authorId?: string;
  content: string;
  currentVote: VoteType | null;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
};

