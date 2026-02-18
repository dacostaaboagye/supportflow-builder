import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MessageSquare, List, X } from "lucide-react";
import { useFlowStore } from "../stores/flowStore";
import { Button } from "./ui/button";

export function NodesPalette() {
  const { togglePalette } = useFlowStore();

  const onDragStart = (
    event: React.DragEvent,
    nodeType: "message" | "choice",
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card className="w-64 h-auto absolute top-20 left-4 z-40 bg-surface shadow-xl border border-border pointer-events-auto">
      <CardHeader className="p-4 py-3 border-b border-border bg-surface-muted/30 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Add Nodes</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={togglePalette}
        >
          <X className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="text-xs text-text-muted mb-2">Drag to canvas</div>

        <div
          className="flex items-center gap-3 p-3 bg-surface border border-border rounded-md cursor-grab active:cursor-grabbing hover:border-primary hover:bg-primary/5 transition-colors"
          onDragStart={(event) => onDragStart(event, "message")}
          draggable
        >
          <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Message</div>
            <div className="text-[10px] text-text-muted">
              Simple text response
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-3 bg-surface border border-border rounded-md cursor-grab active:cursor-grabbing hover:border-primary hover:bg-primary/5 transition-colors"
          onDragStart={(event) => onDragStart(event, "choice")}
          draggable
        >
          <div className="w-8 h-8 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
            <List className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Choice</div>
            <div className="text-[10px] text-text-muted">Multiple options</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
