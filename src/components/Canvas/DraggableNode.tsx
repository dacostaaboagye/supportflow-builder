import { useRef, useState, useEffect } from "react";
import { useFlowStore } from "../../stores/flowStore";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import type { FlowNode, HandleId, HandleType, NodeOption } from "../../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DraggableNodeProps {
  node: FlowNode;
  zoom: number;
}

interface HandleDef {
  type: HandleType;
  position: HandleId;
  className: string;
}

interface NodeHandleProps {
  nodeId: string;
  type: HandleType;
  position: HandleId;
  className: string;
  /** For option handles: the option UUID used as the connection sourceHandle. */
  optionId?: string;
}

// ---------------------------------------------------------------------------
// Sub-component: NodeHandle
// ---------------------------------------------------------------------------

function NodeHandle({
  nodeId,
  type,
  position,
  className,
  optionId,
}: Readonly<NodeHandleProps>) {
  const handleId = optionId || position;
  const domId = `handle-${nodeId}-${position}${optionId ?? ""}`;

  const onMouseDown = (e: React.MouseEvent) => {
    if (type !== "source") return;
    e.stopPropagation();
    useFlowStore.getState().startConnection(nodeId, handleId, { x: 0, y: 0 });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (type !== "target") return;
    e.stopPropagation();
    const state = useFlowStore.getState();
    const pending = state.ui.connectionPending;
    if (pending && pending.sourceId !== nodeId) {
      state.addConnection({
        sourceId: pending.sourceId,
        targetId: nodeId,
        sourceHandle: pending.sourceHandle,
        targetHandle: position,
      });
      state.endConnection();
    }
  };

  return (
    <div
      id={domId}
      tabIndex={-1}
      className={cn(
        "absolute w-3 h-3 bg-surface border-2 border-connector rounded-full",
        "hover:bg-primary hover:border-primary transition-colors cursor-crosshair z-20",
        className,
      )}
      title={`${type} handle`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    />
  );
}

// ---------------------------------------------------------------------------
// Sub-component: OptionsList (rendered inside Choice nodes)
// ---------------------------------------------------------------------------

function OptionsList({
  nodeId,
  options,
}: Readonly<{ nodeId: string; options: NodeOption[] }>) {
  return (
    <div className="flex flex-col gap-1 mt-2">
      {options.map((opt) => (
        <div
          key={opt.id}
          className="relative bg-surface-muted p-1.5 rounded border border-border flex items-center justify-between"
        >
          <span>{opt.label}</span>
          <NodeHandle
            nodeId={nodeId}
            type="source"
            position="right"
            className="static translate-x-[18px]"
            optionId={opt.id}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const TARGET_HANDLES: HandleDef[] = [
  {
    type: "target",
    position: "top",
    className: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
  },
  {
    type: "target",
    position: "left",
    className: "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
  },
];

const MESSAGE_SOURCE_HANDLES: HandleDef[] = [
  {
    type: "source",
    position: "right",
    className: "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
  },
  {
    type: "source",
    position: "bottom",
    className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  },
];

export function DraggableNode({ node, zoom }: Readonly<DraggableNodeProps>) {
  const { moveNode, selectNode, selectedNodeId } = useFlowStore();
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Compose the set of handles for this node
  const handles: HandleDef[] =
    node.type === "message"
      ? [...TARGET_HANDLES, ...MESSAGE_SOURCE_HANDLES]
      : [...TARGET_HANDLES];

  // -- Drag behaviour -------------------------------------------------------

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
    setIsDragging(true);
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

  // -- Render ---------------------------------------------------------------

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

          {node.type === "choice" && node.data.options && (
            <OptionsList nodeId={node.id} options={node.data.options} />
          )}
        </CardContent>
      </Card>

      {/* Standard handles */}
      {handles.map((h) => (
        <NodeHandle
          key={`${h.type}-${h.position}`}
          nodeId={node.id}
          type={h.type}
          position={h.position}
          className={h.className}
        />
      ))}
    </div>
  );
}
