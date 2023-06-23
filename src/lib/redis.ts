import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.REDIT_URL!,
  token: process.env.REDIT_SECRET!,
});
