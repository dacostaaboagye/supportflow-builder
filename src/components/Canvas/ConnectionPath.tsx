import { useState } from "react";
import { getHandleCoords } from "../../lib/getHandleCoords";
import type { FlowConnection, FlowNode } from "../../types";
import {
  ACTIVE_COLOR,
  bezierMidpoint,
  buildBezierD,
  CONNECTOR_COLOR,
  DELETE_COLOR,
} from "../../lib/canvas-utils/connectionLayerUtils";
import { X } from "lucide-react";

interface ConnectionPathProps {
  connection: FlowConnection;
  nodes: FlowNode[];
  isSelected: boolean;
  defaultMarkerId: string;
  activeMarkerId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConnectionPath({
  connection,
  nodes,
  isSelected,
  defaultMarkerId,
  activeMarkerId,
  onSelect,
  onDelete,
}: Readonly<ConnectionPathProps>) {
  const [isHovered, setIsHovered] = useState(false);
  const source = nodes.find((n) => n.id === connection.sourceId);
  const target = nodes.find((n) => n.id === connection.targetId);
  if (!source || !target) return null;

  const from = getHandleCoords(
    connection.sourceId,
    source.position,
    connection.sourceHandle,
  );
  
  const to = getHandleCoords(
    connection.targetId,
    target.position,
    connection.targetHandle,
  );

  const d = buildBezierD(from, to);
  const mid = bezierMidpoint(from, to);
  const highlighted = isSelected || isHovered;

  return (
    <g>
      <path
        d={d}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        stroke="transparent"
        strokeWidth="16"
        fill="none"
        style={{ cursor: "pointer", pointerEvents: "stroke" }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(connection.id);
        }}
      />

      <path
        d={d}
        stroke={highlighted ? ACTIVE_COLOR : CONNECTOR_COLOR}
        strokeWidth={highlighted ? "2.5" : "2"}
        fill="none"
        markerEnd={`url(#${highlighted ? activeMarkerId : defaultMarkerId})`}
        style={{
          opacity: highlighted ? 1 : 0.8,
          transition: "stroke 0.15s, stroke-width 0.15s, opacity 0.15s",
        }}
        className="pointer-events-none"
      />

      {highlighted && (
        <foreignObject
          x={mid.x - 10}
          y={mid.y - 10}
          width={20}
          height={20}
          style={{ pointerEvents: "all" }}
        >
          <button
            type="button"
            className="w-5 h-5 rounded-full bg-surface border text-[11px] leading-none flex items-center justify-center"
            style={{ borderColor: DELETE_COLOR, color: DELETE_COLOR }}
            aria-label="Delete connection"
            title="Delete connection"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(connection.id);
            }}
          >
            <X/>
          </button>
        </foreignObject>
      )}
    </g>
  );
}
