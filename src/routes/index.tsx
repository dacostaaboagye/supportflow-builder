import { createFileRoute } from "@tanstack/react-router";
import { FlowCanvas } from "../components/Canvas/FlowCanvas";
import { EditorPanel } from "../components/EditorPanel";
import { NodesPalette } from "../components/NodesPalette";
import { ChatPreview } from "../components/Preview/ChatPreview";
import { Toolbar } from "../components/Toolbar";
import { useFlowStore } from "../stores/flowStore";

function App() {
	const { mode, ui } = useFlowStore();
	const showPalette = ui.showPalette;
	const showEditor = ui.showEditor;

	return (
		<div className="w-full h-screen relative flex overflow-hidden">
			<Toolbar />

			{mode === "editor" && showPalette && <NodesPalette />}

			<div className="flex-1 relative">
				<FlowCanvas />
			</div>

			{mode === "editor" && showEditor && <EditorPanel />}

			{mode === "preview" && <ChatPreview />}
		</div>
	);
}

export const Route = createFileRoute("/")({
	component: App,
});
