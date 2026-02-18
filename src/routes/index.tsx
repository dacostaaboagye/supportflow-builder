import { FlowCanvas } from "../components/Canvas/FlowCanvas";
import { EditorPanel } from "../components/EditorPanel";
import { ChatPreview } from "../components/Preview/ChatPreview";
import { Toolbar } from "../components/Toolbar";
import { NodesPalette } from "../components/NodesPalette";
import { useFlowStore } from "../stores/flowStore";
import { createFileRoute } from "@tanstack/react-router";

function App() {
  const { mode } = useFlowStore();

  return (
    <div className="w-full h-screen relative flex overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Left Palette (Editor Mode Only) */}
      {mode === "editor" && useFlowStore((s) => s.ui.showPalette) && (
        <NodesPalette />
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <FlowCanvas />
      </div>

      {/* Editor Panel Overlay (only in editor mode) */}
      {mode === "editor" && useFlowStore((s) => s.ui.showEditor) && (
        <EditorPanel />
      )}

      {/* Preview Overlay (only in preview mode) */}
      {mode === "preview" && <ChatPreview />}
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: App,
});
