import { useRef, useState } from "react";
import Board, { type BoardHandle } from "@/components/board/Board";
import BoardHeader from "@/components/board/BoardHeader";
import CommentsPanel from "@/components/comments/CommentsPanel";
import CommentsSidebar from "@/components/comments/CommentsSidebar";
import { useBoardComments } from "@/hooks/useBoardComments";

function App() {
  const {
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
  } = useBoardComments();
  const boardRef = useRef<BoardHandle>(null);
  const commentsButtonRef = useRef<HTMLButtonElement>(null);
  const [toolbarHost, setToolbarHost] = useState<HTMLDivElement | null>(null);

  function focusThread(id: string) {
    const thread = openThread(id);
    if (thread) boardRef.current?.focusComment(thread.position);
  }

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
              ref={boardRef}
              threads={threads}
              activeThreadId={commentsOpen ? activeThreadId : null}
              onCreateThread={createThread}
              onMoveThread={moveThread}
              onSelectThread={toggleThread}
              toolbarHost={toolbarHost}
            />
          </main>
          <div
            ref={setToolbarHost}
            className="pointer-events-none absolute inset-0 z-10"
          />
          <CommentsPanel open={commentsOpen}>
            <CommentsSidebar
              open={commentsOpen}
              threads={threads}
              activeThreadId={activeThreadId}
              status={statusFilter}
              onChangeStatus={selectStatusFilter}
              onSelectThread={focusThread}
              onReply={replyToThread}
              onEdit={editMessage}
              onClose={closeComments}
            />
          </CommentsPanel>
        </div>
      </div>
    </div>
  );
}

export default App;
