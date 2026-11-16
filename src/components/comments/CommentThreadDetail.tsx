import { useRef, useState, type Ref } from "react";
import { Check, Pencil, Reply, RotateCcw } from "lucide-react";
import type { CommentThread } from "@/data/commentStorage";
import { isCurrentUser } from "@/data/currentUser";

type CommentThreadDetailProps = {
  thread: CommentThread;
  onReply: (threadId: string, body: string) => boolean;
  onEdit: (threadId: string, messageId: string, body: string) => boolean;
  onSetResolved: (threadId: string, resolved: boolean) => void;
};

type MessageFormProps = {
  label: string;
  submitLabel: string;
  onSubmit: (body: string) => boolean;
  initialText?: string;
  inputRef?: Ref<HTMLTextAreaElement>;
  onCancel?: () => void;
};

const timestamp = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function MessageForm({
  label,
  submitLabel,
  onSubmit,
  initialText = "",
  inputRef,
  onCancel,
}: MessageFormProps) {
  const [text, setText] = useState(initialText);
  const body = text.trim();

  return (
    <form
      className={`mt-3 rounded-xl border border-plot-border bg-plot-surface p-2 focus-within:border-plot-focus-ring
                  ${onCancel ? "plot-comment-message-enter" : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        if (body && onSubmit(body)) setText("");
      }}
    >
      <textarea
        ref={inputRef}
        aria-label={label}
        autoFocus={Boolean(onCancel)}
        placeholder={onCancel ? undefined : "Write a reply…"}
        rows={2}
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="block w-full resize-y rounded-lg px-2 py-1 text-sm outline-none placeholder:text-plot-text-muted"
      />
      <div className="mt-2 flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="plot-toolbar-button px-2.5 py-1.5 text-xs font-semibold"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!body}
          className="plot-toolbar-button bg-plot-accent px-3 py-1.5 text-xs font-semibold text-plot-accent-foreground
                    hover:bg-plot-accent/90 disabled:cursor-default disabled:opacity-45"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function CommentThreadDetail({
  thread,
  onReply,
  onEdit,
  onSetResolved,
}: CommentThreadDetailProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const replyInput = useRef<HTMLTextAreaElement>(null);
  const resolved = thread.status === "resolved";

  return (
    <section
      aria-label="Selected thread"
      className="mx-4 min-h-0 flex-1 overflow-y-auto border-t border-plot-border pt-3 pb-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Thread</h3>
        <button
          type="button"
          onClick={() => onSetResolved(thread.id, !resolved)}
          className={`plot-toolbar-button inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold
                      ${resolved ? "bg-plot-resolved-soft text-plot-resolved" : "bg-plot-accent-soft text-plot-accent-soft-foreground"}`}
        >
          {resolved ? (
            <RotateCcw size={14} aria-hidden="true" />
          ) : (
            <Check size={14} aria-hidden="true" />
          )}
          {resolved ? "Reopen" : "Resolve"}
        </button>
      </div>
      <ol className="space-y-4">
        {thread.messages.map(({ id, author, body, createdAt }, index) => (
          <li
            key={id}
            className={`plot-comment-message rounded-lg p-2.5 hover:bg-plot-toolbar-hover motion-safe:transition-colors
                        motion-safe:duration-(--plot-motion-feedback) motion-safe:ease-(--plot-motion-ease-feedback)
                        ${index > 0 ? "plot-comment-message-enter ml-3 bg-plot-surface-muted" : ""}`}
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-plot-accent/20 text-xs
                            font-semibold text-plot-accent-soft-foreground"
              >
                {author.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="wrap-anywhere text-sm font-semibold">
                  {author.name}
                </p>
                <time
                  dateTime={createdAt}
                  className="text-xs text-plot-text-muted"
                >
                  {timestamp.format(new Date(createdAt))}
                </time>
              </div>
              {editingId !== id && (
                <div className="plot-comment-actions flex shrink-0 items-center gap-1 empty:hidden">
                  {isCurrentUser(author) && (
                    <button
                      type="button"
                      aria-label={index === 0 ? "Edit comment" : "Edit reply"}
                      title="Edit"
                      onClick={() => setEditingId(id)}
                      className="plot-toolbar-button grid size-7 place-items-center"
                    >
                      <Pencil size={14} aria-hidden="true" />
                    </button>
                  )}
                  {index === 0 && (
                    <button
                      type="button"
                      aria-label="Reply to thread"
                      title="Reply"
                      onClick={() => replyInput.current?.focus()}
                      className="plot-toolbar-button grid size-7 place-items-center"
                    >
                      <Reply size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>
            {editingId === id ? (
              <MessageForm
                label={index === 0 ? "Edit comment" : "Edit reply"}
                submitLabel="Save"
                initialText={body}
                onCancel={() => setEditingId(null)}
                onSubmit={(text) => {
                  const saved = onEdit(thread.id, id, text);
                  if (saved) setEditingId(null);
                  return saved;
                }}
              />
            ) : (
              <p className="mt-2 wrap-anywhere text-sm whitespace-pre-wrap">
                {body}
              </p>
            )}
          </li>
        ))}
      </ol>
      <MessageForm
        label="Write a reply"
        submitLabel="Reply"
        inputRef={replyInput}
        onSubmit={(body) => onReply(thread.id, body)}
      />
    </section>
  );
}
