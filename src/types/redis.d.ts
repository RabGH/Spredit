import { Vote, Post } from "@prisma/client";

export type CachedPost = {
  id: string;
  title: string;
  authorUsername: string;
  authorId: string;
  content: string;
  currentVote: VoteType | null;
  createdAt: Date;
  updatedAt: Date;
};
// addded post and updatedAt
