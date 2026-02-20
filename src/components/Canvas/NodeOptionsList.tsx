import { NodeHandle } from "./NodeHandle";
import type { NodeOptionsListProps } from "../../lib/canvas-utils/nodeTypes";

export function NodeOptionsList({
  nodeId,
  options,
}: Readonly<NodeOptionsListProps>) {
  return (
    <div className="flex flex-col gap-1 mt-2 w-[calc(100%+1rem)]">
      {options.map((option) => (
        <div
          key={option.id}
          className="relative bg-surface-muted p-1.5 rounded border border-border flex items-center justify-between overflow-visible after:absolute after:top-0 after:right-0 after:w-1 after:h-full after:bg-primary after:z-10"
        >
          <span className="text-xs">{option.label}</span>
          <NodeHandle
            nodeId={nodeId}
            type="source"
            position="right"
            className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2"
            optionId={option.id}
          />
        </div>
      ))}
    </div>
  );
}
