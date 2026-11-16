import type { XYPosition } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";

import {
  loadCommentThreads,
  saveCommentThreads,
  type CommentThread,
} from "@/data/commentStorage";
import { currentUser } from "@/data/currentUser";

export function useBoardComments() {
  const [threads, setThreads] = useState(loadCommentThreads);
  const savedThreads = useRef(threads);

  useEffect(() => {
    if (threads !== savedThreads.current && saveCommentThreads(threads)) {
      savedThreads.current = threads;
    }
  }, [threads]);

  function createThread(position: XYPosition, body: string): boolean {
    const text = body.trim();
    if (!text) return false;

    const thread: CommentThread = {
      id: crypto.randomUUID(),
      position,
      status: "open",
      messages: [
        {
          id: crypto.randomUUID(),
          author: currentUser,
          body: text,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setThreads((current) => [...current, thread]);
    return true;
  }

  return { threads, createThread };
}
