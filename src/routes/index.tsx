import { FlowCanvas } from "../components/Canvas/FlowCanvas";
import { EditorPanel } from "../components/EditorPanel";
import { ChatPreview } from "../components/Preview/ChatPreview";
import { Toolbar } from "../components/Toolbar";
import { useFlowStore } from "../stores/flowStore";
import { createFileRoute } from "@tanstack/react-router";

function App() {
  const { mode } = useFlowStore();

  return (
    <div className="w-full h-screen relative flex overflow-hidden">
      <Toolbar />

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <FlowCanvas />
      </div>

      {/* Editor Panel Overlay (only in editor mode) */}
      {mode === "editor" && <EditorPanel />}

      {/* Preview Overlay (only in preview mode) */}
      {mode === "preview" && <ChatPreview />}
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: App,
});
