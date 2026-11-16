import { useRef } from "react";
import Board from "@/components/board/Board";
import BoardHeader from "@/components/board/BoardHeader";
import CommentsPanel from "@/components/comments/CommentsPanel";
import CommentsSidebar from "@/components/comments/CommentsSidebar";
import { useBoardComments } from "@/hooks/useBoardComments";

function App() {
  const {
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
  } = useBoardComments();
  const commentsButtonRef = useRef<HTMLButtonElement>(null);

  function closeComments() {
    closeSidebar();
    commentsButtonRef.current?.focus();
  }

  return (
    <div className="flex h-dvh flex-col bg-plot-border p-1">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
        <BoardHeader
          commentsOpen={commentsOpen}
          commentsButtonRef={commentsButtonRef}
          onToggleComments={commentsOpen ? closeComments : openSidebar}
        />
        <div className="relative flex min-h-0 flex-1">
          <main className="relative min-w-0 flex-1 overflow-hidden bg-plot-canvas">
            <Board
              threads={threads}
              activeThreadId={commentsOpen ? activeThreadId : null}
              onCreateThread={createThread}
              onSelectThread={toggleThread}
            />
          </main>
          <CommentsPanel open={commentsOpen}>
            <CommentsSidebar
              open={commentsOpen}
              threads={threads}
              activeThreadId={activeThreadId}
              status={statusFilter}
              onChangeStatus={selectStatusFilter}
              onSelectThread={openThread}
              onClose={closeComments}
            />
          </CommentsPanel>
        </div>
      </div>
    </div>
  );
}

export default App;
