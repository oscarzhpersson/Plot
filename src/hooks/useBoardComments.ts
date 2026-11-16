import type { XYPosition } from "@xyflow/react";
import { useEffect, useRef, useState } from "react";

import {
  loadCommentThreads,
  saveCommentThreads,
  type CommentThread,
} from "@/data/commentStorage";
import { currentUser, isCurrentUser } from "@/data/currentUser";

type CommentMessage = CommentThread["messages"][number];

function createMessage(body: string): CommentMessage {
  return {
    id: crypto.randomUUID(),
    author: currentUser,
    body,
    createdAt: new Date().toISOString(),
  };
}

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
      messages: [createMessage(text)],
    };

    setThreads((current) => [...current, thread]);
    return true;
  }

  function updateThread(id: string, update: (thread: CommentThread) => CommentThread) {
    setThreads((current) => current.map((thread) =>
      thread.id === id ? update(thread) : thread,
    ));
  }

  function moveThread(id: string, position: XYPosition) {
    updateThread(id, (thread) => ({ ...thread, position }));
  }

  function replyToThread(id: string, body: string): boolean {
    const text = body.trim();
    if (!text || !threads.some((thread) => thread.id === id)) return false;

    const message = createMessage(text);
    updateThread(id, (thread) => ({ ...thread, messages: [...thread.messages, message] }));
    return true;
  }

  function editMessage(threadId: string, messageId: string, body: string): boolean {
    const text = body.trim();
    if (!text) return false;

    const message = threads.find(({ id }) => id === threadId)?.messages.find(({ id }) => id === messageId);
    if (!message || !isCurrentUser(message.author)) return false;
    if (message.body === text) return true;

    const replaceBody = (message: CommentMessage) =>
      message.id === messageId ? { ...message, body: text } : message;

    updateThread(threadId, (thread) => {
      const [first, ...replies] = thread.messages;
      return { ...thread, messages: [replaceBody(first), ...replies.map(replaceBody)] };
    });
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
    return thread;
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
    moveThread,
    replyToThread,
    editMessage,
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
