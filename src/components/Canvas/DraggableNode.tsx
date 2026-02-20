import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useFlowStore } from "../../stores/flowStore";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { NodeHandle } from "./NodeHandle";
import { NodeOptionsList } from "./NodeOptionsList";
import {
  MESSAGE_SOURCE_HANDLES,
  TARGET_HANDLES,
} from "../../lib/canvas-utils/nodeHandleDefs";
import type {
  DraggableNodeProps,
  HandleDef,
} from "../../lib/canvas-utils/nodeTypes";

export function DraggableNode({ node, zoom }: Readonly<DraggableNodeProps>) {
  const { moveNode, selectNode, selectedNodeId } = useFlowStore();
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLButtonElement>(null);

  const handles: HandleDef[] =
    node.type === "message"
      ? [...TARGET_HANDLES, ...MESSAGE_SOURCE_HANDLES]
      : [...TARGET_HANDLES];

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
    setIsDragging(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
    useFlowStore.getState().setEditorOpen(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      moveNode(node.id, {
        x: node.position.x + e.movementX / zoom,
        y: node.position.y + e.movementY / zoom,
      });
    };
    const onUp = () => setIsDragging(false);

    globalThis.addEventListener("mousemove", onMove);
    globalThis.addEventListener("mouseup", onUp);
    return () => {
      globalThis.removeEventListener("mousemove", onMove);
      globalThis.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, node.id, node.position, moveNode, zoom]);

  const isSelected = selectedNodeId === node.id;

  return (
    <button
      type="button"
      ref={nodeRef}
      id={node.id}
      aria-label={`Node ${node.data.label}`}
      style={{
        position: "absolute",
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        width: "280px",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "cursor-grab active:cursor-grabbing group select-none text-left",
        isSelected && "z-10",
      )}
    >
      <Card
        className={cn(
          "rounded-xl border transition-all duration-200 overflow-visible",
          isSelected
            ? "border-primary shadow-lg ring-2 ring-primary/20"
            : "border-border hover:border-primary/30 hover:shadow-md",
        )}
      >
        <CardHeader
          className={cn(
            "p-3 pb-1.5 rounded-t-xl border-b",
            node.type === "choice"
              ? "bg-accent-choice-bg border-accent-choice/20"
              : "bg-accent-message-bg border-accent-message/20",
          )}
        >
          <CardTitle className="text-[13px] font-semibold flex items-center justify-between gap-2 text-text-main">
            <span className="truncate">{node.data.label}</span>
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 border",
                node.type === "choice"
                  ? "bg-accent-choice-bg text-accent-choice border-accent-choice/30"
                  : "bg-accent-message-bg text-accent-message border-accent-message/30",
              )}
            >
              {node.type === "choice" ? "Choice" : "Message"}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 pt-0 text-xs text-text-muted leading-relaxed">
          <div className="mb-1.5 line-clamp-2">
            {node.data.content || "Double-click to edit..."}
          </div>

          {node.type === "choice" && node.data.options && (
            <NodeOptionsList nodeId={node.id} options={node.data.options} />
          )}
        </CardContent>
      </Card>

      {handles.map((handle) => (
        <NodeHandle
          key={`${handle.type}-${handle.position}`}
          nodeId={node.id}
          type={handle.type}
          position={handle.position}
          className={handle.className}
        />
      ))}
    </button>
  );
}
