import { X } from "lucide-react";
import { useFlowStore } from "../stores/flowStore";
import type { NodeData } from "../types";
import { ChoiceOptionsEditor } from "./EditorPanel/ChoiceOptionsEditor";
import { EmptyInspector } from "./EditorPanel/EmptyInspector";
import { NodeFields } from "./EditorPanel/NodeFields";
import { NodeTypeBadge } from "./EditorPanel/NodeTypeBadge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function EditorPanel() {
	const { selectedNodeId, nodes, updateNode, deleteNode, setEditorOpen } =
		useFlowStore();
	const selectedNode = nodes.find((node) => node.id === selectedNodeId);

	if (!selectedNode) {
		return <EmptyInspector onClose={() => setEditorOpen(false)} />;
	}

	const handleChange = (field: keyof NodeData, value: string) => {
		updateNode(selectedNode.id, { [field]: value });
	};

	const handleAddOption = () => {
		const current = selectedNode.data.options ?? [];
		updateNode(selectedNode.id, {
			options: [...current, { id: crypto.randomUUID(), label: "New Option" }],
		});
	};

	const handleUpdateOption = (optionId: string, label: string) => {
		const current = selectedNode.data.options ?? [];
		updateNode(selectedNode.id, {
			options: current.map((opt) =>
				opt.id === optionId ? { ...opt, label } : opt,
			),
		});
	};

	const handleDeleteOption = (optionId: string) => {
		const current = selectedNode.data.options ?? [];
		updateNode(selectedNode.id, {
			options: current.filter((opt) => opt.id !== optionId),
		});
	};

	return (
		<Card className="w-80 h-full border-l rounded-none border-border/50 bg-surface/95 backdrop-blur-sm shadow-xl absolute right-0 top-0 flex flex-col pointer-events-auto">
			<CardHeader className="border-b border-border/50 flex flex-row items-center justify-between p-4 py-3">
				<CardTitle className="text-sm font-semibold">Inspector</CardTitle>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0"
					onClick={() => setEditorOpen(false)}
				>
					<X className="w-4 h-4" />
				</Button>
			</CardHeader>

			<CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
				<NodeTypeBadge node={selectedNode} />

				<NodeFields
					label={selectedNode.data.label}
					content={selectedNode.data.content}
					onChange={handleChange}
				/>

				{selectedNode.type === "choice" && (
					<ChoiceOptionsEditor
						options={selectedNode.data.options ?? []}
						onAddOption={handleAddOption}
						onUpdateOption={handleUpdateOption}
						onDeleteOption={handleDeleteOption}
					/>
				)}
			</CardContent>

			<div className="p-4 border-t border-border">
				<Button
					variant="destructive"
					className="w-full"
					onClick={() => deleteNode(selectedNode.id)}
				>
					Delete Node
				</Button>
			</div>
		</Card>
	);
}
