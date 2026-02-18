import { getHandleCoords } from "@/lib/getHandleCoords";
import { useFlowStore } from "../../stores/flowStore";

export function ConnectionLayer() {
  const { connections, nodes, ui } = useFlowStore();

  const getNodeData = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? { x: node.position.x, y: node.position.y } : null;
  };

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9" // Slightly adjusted for path end
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
        </marker>
      </defs>
      {connections.map((connection) => {
        const sourcePos = getNodeData(connection.sourceId);
        const targetPos = getNodeData(connection.targetId);

        if (!sourcePos || !targetPos) return null;

        const { x: x1, y: y1 } = getHandleCoords(
          connection.sourceId,
          sourcePos,
          connection.sourceHandle,
        );
        const { x: x2, y: y2 } = getHandleCoords(
          connection.targetId,
          targetPos,
          connection.targetHandle,
        );

        // Calculate control points for Bezier curve
        // Horizontal distance for curvature
        const dist = Math.abs(x2 - x1);
        const controlOffset = Math.max(dist * 0.5, 50);

        const pathData = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${
          x2 - controlOffset
        } ${y2}, ${x2} ${y2}`;

        return (
          <g key={connection.id}>
            <path
              d={pathData}
              stroke="#94a3b8"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              style={{ opacity: 0.8 }}
            />
          </g>
        );
      })}

      {/* Pending Connection Line */}
      {ui.connectionPending &&
        (() => {
          const { sourceId, sourceHandle, mousePos } = ui.connectionPending;
          const sourceNode = nodes.find((n) => n.id === sourceId);
          if (!sourceNode) return null;

          const { x: x1, y: y1 } = getHandleCoords(
            sourceId,
            { x: sourceNode.position.x, y: sourceNode.position.y },
            sourceHandle,
          );
          // MousePos is in canvas coords (already transformed in FlowCanvas)
          const x2 = mousePos.x;
          const y2 = mousePos.y;

          const dist = Math.abs(x2 - x1);
          const controlOffset = Math.max(dist * 0.5, 50);

          // Simple curvature to mouse
          const pathData = `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;

          return (
            <path
              d={pathData}
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              markerEnd="url(#arrowhead-active)"
              className="animate-pulse"
            />
          );
        })()}
    </svg>
  );
}
