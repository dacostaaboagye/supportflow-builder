import { getHandleCoords } from "@/lib/getHandleCoords";
import { useFlowStore } from "../../stores/flowStore";


export function ConnectionLayer() {
  const { connections, nodes } = useFlowStore();

  return (
    <svg className="absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none">
      {connections.map((conn) => {
        const start = getHandleCoords(conn.sourceId, conn.sourceHandle, nodes);
        const end = getHandleCoords(conn.targetId, conn.targetHandle, nodes);

        // Simple Bezier Logic
        // For right -> left
        const dist = Math.abs(end.x - start.x) * 0.5;
        const cp1 = { x: start.x + dist, y: start.y };
        const cp2 = { x: end.x - dist, y: end.y };

        // Adjust for vertical if needed, but keeping it simple horizontal flow for now
        const pathData = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

        return (
          <g key={conn.id}>
            <path
              d={pathData}
              stroke="var(--color-connector)"
              strokeWidth="2"
              fill="none"
            />
          </g>
        );
      })}
    </svg>
  );
}
