import { Download, Layout, SlidersHorizontal, Upload } from "lucide-react";
import { useRef } from "react";
import { useFlowStore } from "../stores/flowStore";
import type { FlowConnection, FlowNode } from "../types";

interface ExportData {
	nodes: FlowNode[];
	connections: FlowConnection[];
}

export function Toolbar() {
	const { nodes, connections, setNodes, setConnections } = useFlowStore();
	const showPalette = useFlowStore((s) => s.ui.showPalette);
	const showEditor = useFlowStore((s) => s.ui.showEditor);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleExport = () => {
		const targetIds = new Set(connections.map((c) => c.targetId));
		const sortedNodes = [...nodes].sort((a, b) => {
			const aIsRoot = !targetIds.has(a.id);
			const bIsRoot = !targetIds.has(b.id);
			if (aIsRoot && !bIsRoot) return -1;
			if (!aIsRoot && bIsRoot) return 1;
			return 0;
		});

		const data: ExportData = { nodes: sortedNodes, connections };
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "flow_data.json";
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const json = JSON.parse(text) as ExportData;
			if (json.nodes) {
				setNodes(json.nodes);
				if (json.connections) setConnections(json.connections);
			}
		} catch (err) {
			console.error("Invalid JSON", err);
			alert("Failed to parse JSON");
		}
	};

	return (
		<div className="absolute top-4 left-4 flex gap-1.5 z-50">
			<button
				type="button"
				className={`w-9 h-9 flex items-center justify-center rounded-xl transition-smooth shadow-sm ${
					showPalette
						? "bg-primary text-primary-foreground shadow-md"
						: "glass-panel text-text-muted hover:text-text-main hover:shadow-md"
				}`}
				onClick={() => useFlowStore.getState().togglePalette()}
				title="Toggle Nodes Palette"
			>
				<Layout className="w-4 h-4" />
			</button>

			<button
				type="button"
				className={`w-9 h-9 flex items-center justify-center rounded-xl transition-smooth shadow-sm ${
					showEditor
						? "bg-primary text-primary-foreground shadow-md"
						: "glass-panel text-text-muted hover:text-text-main hover:shadow-md"
				}`}
				onClick={() => useFlowStore.getState().toggleEditor()}
				title="Toggle Inspector"
			>
				<SlidersHorizontal className="w-4 h-4" />
			</button>

			<div className="w-px h-9 bg-border/50 mx-0.5" />

			<button
				type="button"
				className="h-9 px-3 glass-panel rounded-xl text-xs font-medium text-text-muted hover:text-text-main hover:shadow-md transition-smooth shadow-sm flex items-center gap-1.5"
				onClick={handleExport}
			>
				<Download className="w-3.5 h-3.5" /> Export
			</button>

			<div className="relative">
				<button
					type="button"
					className="h-9 px-3 glass-panel rounded-xl text-xs font-medium text-text-muted hover:text-text-main hover:shadow-md transition-smooth shadow-sm flex items-center gap-1.5"
					onClick={() => fileInputRef.current?.click()}
				>
					<Upload className="w-3.5 h-3.5" /> Import
				</button>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleImport}
					className="hidden"
					accept=".json"
				/>
			</div>
		</div>
	);
}
