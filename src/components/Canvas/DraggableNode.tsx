import React, { useRef, useState, useEffect } from "react";
import { useFlowStore, type Node } from "../../stores/flowStore";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

interface DraggableNodeProps {
  node: Node;
  zoom: number;
}

export function DraggableNode({ node, zoom }: DraggableNodeProps) {
  const { moveNode, selectNode, selectedNodeId } = useFlowStore();
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Handles
  const handles = [
    {
      type: "target",
      position: "top",
      class: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
    },
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
    {
      type: "target",
      position: "left",
      class: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
    },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      moveNode(node.id, {
        x: node.position.x + e.movementX / zoom,
        y: node.position.y + e.movementY / zoom,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, node.id, node.position, moveNode, zoom]);

  const isSelected = selectedNodeId === node.id;

  return (
    <div
      ref={nodeRef}
      style={{
        position: "absolute",
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        width: "280px", // Fixed width for consistent look
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
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            {node.data.label}
            {node.type === "choice" && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                Choice
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-2 text-xs text-text-muted line-clamp-2">
          {node.data.content || "Empty content..."}
        </CardContent>
      </Card>

      {/* Handles */}
      {handles.map((handle, i) => (
        <div
          key={i}
          className={cn(
            "absolute w-3 h-3 bg-surface border-2 border-connector rounded-full hover:bg-primary hover:border-primary transition-colors cursor-crosshair z-20",
            handle.class,
            // Only show relevant handles for simplified UX if needed, or all for flexibility
          )}
          title={`${handle.type} handle`}
        />
      ))}
    </div>
  );
}
