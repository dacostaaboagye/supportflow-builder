import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { MessageSquare, GitBranch, X } from "lucide-react";
import { useFlowStore } from "../stores/flowStore";
import { Button } from "./ui/button";
import type { NodeType } from "../types";

interface NodeItemProps {
  type: NodeType;
  icon: React.ReactNode;
  label: string;
  description: string;
  accentClass: string;
  onDragStart: (e: React.DragEvent, type: NodeType) => void;
}

function NodeItem({
  type,
  icon,
  label,
  description,
  accentClass,
  onDragStart,
}: Readonly<NodeItemProps>) {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md transition-smooth group"
      onDragStart={(e) => onDragStart(e, type)}
      draggable
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-smooth ${accentClass}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text-main">{label}</div>
        <div className="text-[11px] text-text-muted leading-snug">
          {description}
        </div>
      </div>
    </div>
  );
}

export function NodesPalette() {
  const { togglePalette } = useFlowStore();

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Card className="w-60 h-auto absolute top-16 left-4 z-40 glass-panel shadow-float rounded-2xl pointer-events-auto border-border/50">
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Nodes
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 rounded-lg"
          onClick={togglePalette}
        >
          <X className="w-3 h-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-1 space-y-2">
        <NodeItem
          type="message"
          icon={<MessageSquare className="w-4 h-4 text-accent-message" />}
          label="Message"
          description="Send a text response"
          accentClass="bg-accent-message-bg"
          onDragStart={onDragStart}
        />
        <NodeItem
          type="choice"
          icon={<GitBranch className="w-4 h-4 text-accent-choice" />}
          label="Choice"
          description="Branch with options"
          accentClass="bg-accent-choice-bg"
          onDragStart={onDragStart}
        />
      </CardContent>
    </Card>
  );
}
