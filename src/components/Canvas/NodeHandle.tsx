import { cn } from "../../lib/utils";
import { useFlowStore } from "../../stores/flowStore";
import type { NodeHandleProps } from "../../lib/canvas-utils/nodeTypes";

export function NodeHandle({
  nodeId,
  type,
  position,
  className,
  optionId,
}: Readonly<NodeHandleProps>) {
  const handleId = optionId || position;
  const domId = `handle-${nodeId}-${position}${optionId ?? ""}`;

  const startFromSource = () => {
    if (type !== "source") return;
    useFlowStore.getState().startConnection(nodeId, handleId, { x: 0, y: 0 });
  };

  const completeOnTarget = () => {
    if (type !== "target") return;
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
    <button
      type="button"
      id={domId}
      aria-label={`${type} handle`}
      onMouseDown={(e) => {
        e.stopPropagation();
        startFromSource();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        completeOnTarget();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        if (type === "source") startFromSource();
        if (type === "target") completeOnTarget();
      }}
      className={cn(
        "absolute w-3 h-3 bg-surface border-2 border-connector rounded-full",
        "hover:bg-primary hover:border-primary transition-colors cursor-crosshair z-20",
        className,
      )}
      title={`${type} handle`}
    />
  );
}
