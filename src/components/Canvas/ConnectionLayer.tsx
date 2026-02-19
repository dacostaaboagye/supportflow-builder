import { useFlowStore } from "../../stores/flowStore";
import { getHandleCoords } from "../../lib/getHandleCoords";
import { useState, useEffect, useCallback } from "react";
import type {
  FlowConnection,
  FlowNode,
  Position,
  ConnectionPending,
} from "../../types";

// ---------------------------------------------------------------------------
// Constants — use CSS custom properties from the design tokens
// ---------------------------------------------------------------------------

const CONNECTOR_COLOR = "var(--color-connector)";
const ACTIVE_COLOR = "var(--color-primary)";
const DELETE_COLOR = "#ef4444"; // red-500

// ---------------------------------------------------------------------------
// Helper: build bezier path string
// ---------------------------------------------------------------------------

function buildBezierD(from: Position, to: Position): string {
  const dist = Math.abs(to.x - from.x);
  const controlOffset = Math.max(dist * 0.5, 50);
  return `M ${from.x} ${from.y} C ${from.x + controlOffset} ${from.y}, ${
    to.x - controlOffset
  } ${to.y}, ${to.x} ${to.y}`;
}

/** Midpoint of the cubic bezier (approximate — average of endpoints). */
function bezierMidpoint(from: Position, to: Position): Position {
  return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}

// ---------------------------------------------------------------------------
// Sub-component: Bezier path between two points (non-interactive)
// ---------------------------------------------------------------------------

interface BezierPathProps {
  from: Position;
  to: Position;
  stroke: string;
  dashed?: boolean;
  markerId: string;
}

function BezierPath({
  from,
  to,
  stroke,
  dashed,
  markerId,
}: Readonly<BezierPathProps>) {
  return (
    <path
      d={buildBezierD(from, to)}
      stroke={stroke}
      strokeWidth="2"
      fill="none"
      strokeDasharray={dashed ? "5,5" : undefined}
      markerEnd={`url(#${markerId})`}
      style={dashed ? undefined : { opacity: 0.8 }}
      className={dashed ? "animate-pulse" : undefined}
    />
  );
}

// ---------------------------------------------------------------------------
// Sub-component: A single committed connection (interactive)
// ---------------------------------------------------------------------------

function ConnectionPath({
  connection,
  nodes,
  isSelected,
  onSelect,
  onDelete,
}: Readonly<{
  connection: FlowConnection;
  nodes: FlowNode[];
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}>) {
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
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Wide invisible hit area for easier clicking */}
      <path
        d={d}
        stroke="transparent"
        strokeWidth="16"
        fill="none"
        style={{ cursor: "pointer", pointerEvents: "stroke" }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(connection.id);
        }}
      />

      {/* Visible path */}
      <path
        d={d}
        stroke={highlighted ? ACTIVE_COLOR : CONNECTOR_COLOR}
        strokeWidth={highlighted ? "2.5" : "2"}
        fill="none"
        markerEnd={`url(#${highlighted ? "arrowhead-active" : "arrowhead"})`}
        style={{
          opacity: highlighted ? 1 : 0.8,
          transition: "stroke 0.15s, stroke-width 0.15s, opacity 0.15s",
        }}
        className="pointer-events-none"
      />

      {/* Delete button at midpoint — shown on hover or selection */}
      {highlighted && (
        <g
          style={{ cursor: "pointer", pointerEvents: "all" }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(connection.id);
          }}
        >
          {/* Background circle */}
          <circle
            cx={mid.x}
            cy={mid.y}
            r="10"
            fill="var(--color-surface)"
            stroke={DELETE_COLOR}
            strokeWidth="1.5"
          />
          {/* × icon */}
          <line
            x1={mid.x - 3.5}
            y1={mid.y - 3.5}
            x2={mid.x + 3.5}
            y2={mid.y + 3.5}
            stroke={DELETE_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={mid.x + 3.5}
            y1={mid.y - 3.5}
            x2={mid.x - 3.5}
            y2={mid.y + 3.5}
            stroke={DELETE_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: The dashed line drawn while dragging a new connection
// ---------------------------------------------------------------------------

function PendingConnectionPath({
  pending,
  nodes,
}: Readonly<{ pending: ConnectionPending; nodes: FlowNode[] }>) {
  const sourceNode = nodes.find((n) => n.id === pending.sourceId);
  if (!sourceNode) return null;

  const from = getHandleCoords(
    pending.sourceId,
    sourceNode.position,
    pending.sourceHandle,
  );
  const to = pending.mousePos;

  return (
    <BezierPath
      from={from}
      to={to}
      stroke={ACTIVE_COLOR}
      dashed
      markerId="arrowhead-active"
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ConnectionLayer() {
  const { connections, nodes, ui, deleteConnection } = useFlowStore();
  const [ready, setReady] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    string | null
  >(null);

  // Wait for the browser to fully paint and lay out node elements
  // before measuring handle positions. Double RAF ensures we skip past
  // the initial paint AND the subsequent layout pass.
  useEffect(() => {
    let cancelled = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) setReady(true);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle Delete / Backspace key to remove selected connection
  useEffect(() => {
    if (!selectedConnectionId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteConnection(selectedConnectionId);
        setSelectedConnectionId(null);
      }
      if (e.key === "Escape") {
        setSelectedConnectionId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedConnectionId, deleteConnection]);

  const handleSelect = useCallback((id: string) => {
    setSelectedConnectionId((prev) => (prev === id ? null : id));
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteConnection(id);
      setSelectedConnectionId(null);
    },
    [deleteConnection],
  );

  // Deselect when clicking elsewhere on the canvas
  const handleSvgClick = useCallback(() => {
    setSelectedConnectionId(null);
  }, []);

  return (
    <svg
      className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0"
      onClick={handleSvgClick}
    >
      <defs>
        <marker
          id="arrowhead"
          viewBox="0 0 8 6"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 8 3 L 0 6 L 2 3 Z" fill={CONNECTOR_COLOR} />
        </marker>
        <marker
          id="arrowhead-active"
          viewBox="0 0 8 6"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 8 3 L 0 6 L 2 3 Z" fill={ACTIVE_COLOR} />
        </marker>
      </defs>

      {ready &&
        connections.map((conn) => (
          <ConnectionPath
            key={conn.id}
            connection={conn}
            nodes={nodes}
            isSelected={selectedConnectionId === conn.id}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        ))}

      {ready && ui.connectionPending && (
        <PendingConnectionPath pending={ui.connectionPending} nodes={nodes} />
      )}
    </svg>
  );
}
