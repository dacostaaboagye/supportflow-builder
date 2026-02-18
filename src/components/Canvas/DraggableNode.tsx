import React, { useRef, useState, useEffect } from "react";
import { useFlowStore, type Node } from "../../stores/flowStore";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

interface DraggableNodeProps {
  node: Node;
  zoom: number;
}

// ... imports

export function DraggableNode({ node, zoom }: DraggableNodeProps) {
  const { moveNode, selectNode, selectedNodeId } = useFlowStore();
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // ... (mouse handling logic remains)

  // Standard Handles (Targets always active)
  const standardHandles = [
    {
      type: "target",
      position: "top",
      class: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    },
    {
      type: "target",
      position: "left",
      class: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
    },
  ];

  // For Message nodes, add standard source handles
  if (node.type === "message") {
    standardHandles.push(
      {
        type: "source",
        position: "right",
        class: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
      },
      {
        type: "source",
        position: "bottom",
        class: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
      },
    );
  }

  // Common handle render logic
  const renderHandle = (
    type: string,
    position: string,
    className: string,
    idSuffix: string = "",
  ) => (
    <div
      key={`${type}-${position}-${idSuffix}`}
      id={`handle-${node.id}-${position}${idSuffix}`} // DOM ID for getHandleCoords
      className={cn(
        "absolute w-3 h-3 bg-surface border-2 border-connector rounded-full hover:bg-primary hover:border-primary transition-colors cursor-crosshair z-20",
        className,
      )}
      title={`${type} handle`}
      onMouseDown={(e) => {
        if (type === "source") {
          e.stopPropagation();
          // Pass unique handle ID (for Choice options, this is the Option ID)
          const sourceHandleId = idSuffix ? idSuffix : position;
          useFlowStore
            .getState()
            .startConnection(node.id, sourceHandleId, { x: 0, y: 0 });
        }
      }}
      onMouseUp={(e) => {
        if (type === "target") {
          e.stopPropagation();
          const state = useFlowStore.getState();
          const pending = state.ui.connectionPending;
          if (pending && pending.sourceId !== node.id) {
            state.addConnection({
              sourceId: pending.sourceId,
              targetId: node.id,
              sourceHandle: pending.sourceHandle,
              targetHandle: position,
            });
            state.endConnection();
          }
        }
      }}
    />
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
    setIsDragging(true);
  };

  // Effect for dragging (same as before) logic omitted for brevity if using replace_content efficiently...
  // But since I'm replacing the whole component body basically, I need to include it.

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      moveNode(node.id, {
        x: node.position.x + e.movementX / zoom,
        y: node.position.y + e.movementY / zoom,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    globalThis.addEventListener("mousemove", handleMouseMove);
    globalThis.addEventListener("mouseup", handleMouseUp);
    return () => {
      globalThis.removeEventListener("mousemove", handleMouseMove);
      globalThis.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, node.id, node.position, moveNode, zoom]);

  const isSelected = selectedNodeId === node.id;

  return (
    <div
      ref={nodeRef}
      id={node.id}
      style={{
        position: "absolute",
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        width: "280px",
      }}
      onMouseDown={handleMouseDown}
      className={cn(
        "cursor-grab active:cursor-grabbing group",
        isSelected && "z-10",
      )}
    >
      <Card
        className={cn(
          "border-2 transition-colors",
          isSelected
            ? "border-primary shadow-md"
            : "border-transparent hover:border-primary/50",
        )}
      >
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            {node.data.label}
            {node.type === "choice" && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                Choice
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 pt-0 text-xs text-text-muted">
          <div className="mb-2 line-clamp-3">
            {node.data.content || "Empty content..."}
          </div>

          {/* Render Options for Choice Node */}
          {node.type === "choice" && node.data.options && (
            <div className="flex flex-col gap-1 mt-2">
              {node.data.options.map((opt) => (
                <div
                  key={opt.id}
                  className="relative bg-surface-muted p-1.5 rounded border border-border flex items-center justify-between group/opt"
                >
                  <span>{opt.label}</span>
                  {/* Option Source Handle */}
                  {renderHandle(
                    "source",
                    "right",
                    "static translate-x-[18px]",
                    opt.id,
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Standard Handles */}
      {standardHandles.map((h) => renderHandle(h.type, h.position, h.class))}
    </div>
  );
}
