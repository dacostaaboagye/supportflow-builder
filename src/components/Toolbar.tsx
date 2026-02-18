import { useFlowStore } from "../stores/flowStore";
import { Button } from "./ui/button";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";
import type { FlowNode, FlowConnection } from "../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExportData {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function Toolbar() {
  const { nodes, connections, setNodes, setConnections } = useFlowStore();
  const showPalette = useFlowStore((s) => s.ui.showPalette);
  const showEditor = useFlowStore((s) => s.ui.showEditor);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data: ExportData = { nodes, connections };
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
    <div className="absolute top-4 left-4 flex gap-2 z-50">
      <Button
        variant={showPalette ? "primary" : "secondary"}
        size="sm"
        onClick={() => useFlowStore.getState().togglePalette()}
        title="Toggle Nodes Palette"
      >
        <span className="text-lg leading-none">+</span>
      </Button>

      <Button
        variant={showEditor ? "primary" : "secondary"}
        size="sm"
        onClick={() => useFlowStore.getState().toggleEditor()}
        title="Toggle Inspector"
      >
        <span className="text-lg leading-none">i</span>
      </Button>

      <div className="w-px h-8 bg-border mx-1" />

      <Button
        variant="secondary"
        size="sm"
        onClick={handleExport}
        className="gap-2"
      >
        <Download className="w-4 h-4" /> Export
      </Button>

      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4" /> Import
        </Button>
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
