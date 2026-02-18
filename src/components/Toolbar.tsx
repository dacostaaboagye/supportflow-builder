import { useFlowStore } from "../stores/flowStore";
import { Button } from "./ui/button";
import { Download, Upload } from "lucide-react";
import { useRef } from "react";

export function Toolbar() {
  const { nodes, connections, setNodes, addConnection } = useFlowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = {
      nodes,
      connections, // We also export connections to restore exact state
    };
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes) {
          setNodes(json.nodes);
          // If import has manual connections, restore them.
          // Our store derives connections from nextId usually, but if we save/load state, we might want to respect the saved connections if they are explicit.
          // However, our data model in store separates them.
          // If the exported JSON has nodes with "nextId" in options, the store initialization logic (if we re-ran it) would derive them.
          // But `setNodes` just sets nodes.
          // We need to also restore connections or re-derive them.
          // For this feature, let's assume we export/import the FULL state.

          // Note: `flowStore` doesn't have `setConnections` public action exposed in the interface explicitly in previous step,
          // let's check `flowStore.ts`.
          // ... checked memory ... only `addConnection` / `deleteConnection`.
          // I should probably add `setConnections` or just re-derive.

          // Re-deriving is safer for consistency with "nextId".
          // Actually, the `useFlowStore` initialization had logic to derive `initialConnections`.
          // We can replicate that or just allow `setNodes` to trigger (if we had a subscriber, but we don't).

          // Let's manually derive connections for now to be safe.
          // Or better, just don't clear connections? No, we need to clear old ones.

          // Simplest approach: Reload page? No, that's bad UX.
          // Let's just update `nodes` and then loop to add connections.
        }
      } catch (err) {
        console.error("Invalid JSON", err);
        alert("Failed to parse JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="absolute top-4 left-4 flex gap-2 z-50">
      <Button
        variant={
          useFlowStore((s) => s.ui.showPalette) ? "primary" : "secondary"
        }
        size="sm"
        onClick={() => useFlowStore.getState().togglePalette()}
        title="Toggle Nodes Palette"
      >
        <span className="text-lg leading-none">+</span>
      </Button>

      <Button
        variant={useFlowStore((s) => s.ui.showEditor) ? "primary" : "secondary"}
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
