import { useFlowStore } from "../stores/flowStore";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import type { NodeData } from "../types";

// ---------------------------------------------------------------------------
// Sub-component: empty state when no node is selected
// ---------------------------------------------------------------------------

function EmptyInspector({ onClose }: Readonly<{ onClose: () => void }>) {
  return (
    <Card className="w-80 h-full border-l rounded-none border-border bg-surface shadow-none absolute right-0 top-0 pointer-events-auto flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4 h-14">
        <span className="text-sm font-semibold">Inspector</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6 text-center text-text-muted">
        <p>Select a node to edit</p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function EditorPanel() {
  const { selectedNodeId, nodes, updateNode, deleteNode, setEditorOpen } =
    useFlowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return <EmptyInspector onClose={() => setEditorOpen(false)} />;
  }

  // -- Handlers -------------------------------------------------------------

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

  // -- Render ---------------------------------------------------------------

  return (
    <Card className="w-80 h-full border-l rounded-none border-border bg-surface shadow-xl absolute right-0 top-0 flex flex-col pointer-events-auto">
      <CardHeader className="border-b border-border bg-surface-muted/30 flex flex-row items-center justify-between p-4 py-3">
        <CardTitle className="text-lg">Node Inspector</CardTitle>
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
        {/* Node type badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase bg-primary/10 text-primary px-2 py-1 rounded">
            {selectedNode.type}
          </span>
          <span className="text-xs text-text-muted font-mono truncate">
            {selectedNode.id}
          </span>
        </div>

        {/* Label */}
        <div className="space-y-2">
          <label
            htmlFor="node-label"
            className="text-sm font-medium leading-none"
          >
            Node Title
          </label>
          <Input
            id="node-label"
            value={selectedNode.data.label}
            onChange={(e) => handleChange("label", e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label
            htmlFor="node-content"
            className="text-sm font-medium leading-none"
          >
            Bot Message
          </label>
          <textarea
            id="node-content"
            className="flex min-h-[80px] w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedNode.data.content}
            onChange={(e) => handleChange("content", e.target.value)}
          />
        </div>

        {/* Options (Choice nodes only) */}
        {selectedNode.type === "choice" && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Branches</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddOption}
                className="h-6 text-xs text-primary"
              >
                + Add
              </Button>
            </div>
            <div className="space-y-2">
              {selectedNode.data.options?.map((opt) => (
                <div key={opt.id} className="flex gap-2">
                  <Input
                    value={opt.label}
                    onChange={(e) => handleUpdateOption(opt.id, e.target.value)}
                    className="h-8"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-text-muted hover:text-destructive"
                    onClick={() => handleDeleteOption(opt.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
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
