import { z } from "zod";
import starterBoard from "./board.json";

const storageKey = "plot.comments.v1";

const messageSchema = z.object({
  id: z.string().min(1),
  author: z.object({
    name: z.string().min(1),
    initials: z.string().min(1),
  }),
  body: z.string().trim().min(1),
  createdAt: z.iso.datetime(),
});

const threadSchema = z.object({
  id: z.string().min(1),
  position: z.object({ x: z.number(), y: z.number() }),
  status: z.enum(["open", "resolved"]),
  messages: z.tuple([messageSchema]).rest(messageSchema),
});

const threadsSchema = z.array(threadSchema);
const starterThreads = threadsSchema.parse(starterBoard.threads);

export type CommentThread = z.infer<typeof threadSchema>;

export function loadCommentThreads(): CommentThread[] {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved === null ? starterThreads : threadsSchema.parse(JSON.parse(saved));
  } catch (error) {
    console.warn("Could not load the saved comment threads.", error);
    return [];
  }
}

export function saveCommentThreads(threads: CommentThread[]): boolean {
  try {
    const snapshot = threadsSchema.parse(threads);
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
    return true;
  } catch (error) {
    console.warn("Could not save the comment threads. Changes may be lost on reload.", error);
    return false;
  }
}
