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
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CommentThread["status"]>("open");
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

  function openSidebar() {
    setCommentsOpen(true);
  }

  function closeSidebar() {
    setCommentsOpen(false);
  }

  function openThread(id: string) {
    const thread = threads.find((candidate) => candidate.id === id);
    if (!thread) return;

    setStatusFilter(thread.status);
    setActiveThreadId(thread.id);
    openSidebar();
  }

  function toggleThread(id: string) {
    if (commentsOpen && activeThreadId === id) {
      closeSidebar();
      return;
    }

    openThread(id);
  }

  function selectStatusFilter(status: CommentThread["status"]) {
    setStatusFilter(status);
    setActiveThreadId(null);
  }

  return {
    threads,
    createThread,
    activeThreadId,
    commentsOpen,
    statusFilter,
    openSidebar,
    closeSidebar,
    openThread,
    toggleThread,
    selectStatusFilter,
  };
}
