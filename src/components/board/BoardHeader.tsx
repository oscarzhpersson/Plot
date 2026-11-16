import { Box, ChevronRight, MessageCircle } from "lucide-react";
import { currentUser } from "@/data/currentUser";

export default function BoardHeader() {
  return (
    <header className="z-10 flex h-17 shrink-0 items-center justify-between gap-3 border-b border-plot-border bg-plot-surface px-3 text-plot-text sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-plot-accent text-plot-accent-foreground">
            <Box size={17} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="text-xl font-bold">Plot</span>
        </div>
        <ChevronRight
          className="shrink-0 text-plot-text-muted"
          size={14}
          aria-hidden="true"
        />
        <span className="truncate text-sm font-semibold sm:text-base">
          Take Home Assignment
        </span>
        <span className="shrink-0 rounded-lg bg-plot-surface-muted px-2.5 py-1 text-xs font-semibold text-plot-text-muted">
          {currentUser.name}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled
          aria-label="Comments"
          className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-xl bg-plot-surface-muted px-2.5 text-sm font-semibold sm:px-3.5"
        >
          <MessageCircle size={15} strokeWidth={1.75} aria-hidden="true" />
          <span className="hidden sm:inline">Comments</span>
        </button>
        <span className="grid size-8 place-items-center rounded-xl bg-plot-resolved-soft text-xs font-bold text-plot-resolved">
          {currentUser.initials}
        </span>
      </div>
    </header>
  );
}
