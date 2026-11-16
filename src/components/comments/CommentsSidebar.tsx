import { useEffect, useRef } from "react";
import { ChevronRight, X } from "lucide-react";
import type { CommentThread } from "@/data/commentStorage";
import CommentThreadDetail from "./CommentThreadDetail";

type CommentsSidebarProps = {
  open: boolean;
  threads: CommentThread[];
  activeThreadId: string | null;
  status: CommentThread["status"];
  onChangeStatus: (status: CommentThread["status"]) => void;
  onSelectThread: (id: string) => void;
  onReply: (threadId: string, body: string) => boolean;
  onEdit: (threadId: string, messageId: string, body: string) => boolean;
  onSetThreadResolved: (threadId: string, resolved: boolean) => void;
  onClose: () => void;
};

const threadFilters = [
  { status: "open", label: "Open" },
  { status: "resolved", label: "Resolved" },
] as const;

export default function CommentsSidebar({
  open,
  threads,
  activeThreadId,
  status,
  onChangeStatus,
  onSelectThread,
  onReply,
  onEdit,
  onSetThreadResolved,
  onClose,
}: CommentsSidebarProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const visibleThreads = threads.filter((thread) => thread.status === status);
  const activeThread = visibleThreads.find(({ id }) => id === activeThreadId);

  useEffect(() => {
    if (open) headingRef.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <aside
      id="comments-sidebar"
      aria-labelledby="comments-sidebar-heading"
      className="flex h-full min-h-0 flex-col overflow-hidden border-l border-plot-border bg-plot-surface text-plot-text"
    >
      <header className="flex shrink-0 items-center justify-between px-4 pt-4 pb-2">
        <h2
          id="comments-sidebar-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-semibold outline-none"
        >
          Comments
        </h2>
        <button
          type="button"
          aria-label="Close comments"
          onClick={onClose}
          className="plot-toolbar-button grid size-8 place-items-center"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </header>

      <div
        role="group"
        aria-label="Thread status"
        className="mx-4 mb-2 grid shrink-0 grid-cols-2 gap-1 rounded-xl bg-plot-surface-muted p-1"
      >
        {threadFilters.map(({ status: filter, label }) => (
          <button
            key={filter}
            type="button"
            aria-pressed={status === filter}
            onClick={() => onChangeStatus(filter)}
            className="plot-toolbar-button flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-plot-text-muted
                        aria-pressed:bg-plot-surface aria-pressed:text-plot-text aria-pressed:shadow-sm"
          >
            {label}
            <span className="font-normal tabular-nums">
              {threads.filter((thread) => thread.status === filter).length}
            </span>
          </button>
        ))}
      </div>

      {visibleThreads.length > 0 ? (
        <ul
          aria-label="Comment threads"
          className="max-h-[40%] shrink-0 space-y-1 overflow-y-auto px-4 pb-3"
        >
          {visibleThreads.map(
            ({ id, messages: [firstMessage, ...replies] }) => (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={id === activeThreadId}
                  onClick={() => onSelectThread(id)}
                  className="plot-toolbar-button group flex w-full items-center gap-2.5 rounded-xl border border-transparent p-2.5 text-left aria-pressed:border-plot-accent/15"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-plot-surface-muted text-xs font-semibold text-plot-text-muted
                                group-aria-pressed:bg-plot-accent group-aria-pressed:text-plot-accent-foreground"
                  >
                    {firstMessage.author.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {firstMessage.body}
                    </span>
                    <span className="block truncate text-xs text-plot-text-muted">
                      {firstMessage.author.name}
                      {replies.length > 0 &&
                        ` · ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className="shrink-0 text-plot-text-muted"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ),
          )}
        </ul>
      ) : (
        <p className="px-4 pb-4 text-sm text-plot-text-muted">
          {status === "open" && threads.length === 0
            ? "No comments yet. Use the Comment tool to start a thread."
            : `No ${status} threads.`}
        </p>
      )}

      {activeThread ? (
        <CommentThreadDetail
          key={activeThread.id}
          thread={activeThread}
          onReply={onReply}
          onEdit={onEdit}
          onSetResolved={onSetThreadResolved}
        />
      ) : visibleThreads.length > 0 ? (
        <p className="mx-4 border-t border-plot-border py-3 text-sm text-plot-text-muted">
          Select a thread to read it.
        </p>
      ) : null}
    </aside>
  );
}
