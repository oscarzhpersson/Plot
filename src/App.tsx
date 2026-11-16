import Board from "@/components/board/Board";
import BoardHeader from "@/components/board/BoardHeader";

function App() {
  return (
    <div className="flex h-dvh flex-col bg-plot-border p-1 sm:px-2">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
        <BoardHeader />
        <main className="relative min-h-0 flex-1 bg-plot-canvas">
          <Board />
        </main>
      </div>
    </div>
  );
}

export default App;
