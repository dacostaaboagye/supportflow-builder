import { useFlowStore } from "../../stores/flowStore";
import { getHandleCoords } from "../../lib/getHandleCoords";
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

// ---------------------------------------------------------------------------
// Sub-component: Bezier path between two points
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
  const dist = Math.abs(to.x - from.x);
  const controlOffset = Math.max(dist * 0.5, 50);

  const d = `M ${from.x} ${from.y} C ${from.x + controlOffset} ${from.y}, ${
    to.x - controlOffset
  } ${to.y}, ${to.x} ${to.y}`;

  return (
    <path
      d={d}
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
// Sub-component: A single committed connection
// ---------------------------------------------------------------------------

function ConnectionPath({
  connection,
  nodes,
}: Readonly<{
  connection: FlowConnection;
  nodes: FlowNode[];
}>) {
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

  return (
    <g>
      <BezierPath
        from={from}
        to={to}
        stroke={CONNECTOR_COLOR}
        markerId="arrowhead"
      />
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
  const { connections, nodes, ui } = useFlowStore();

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={CONNECTOR_COLOR} />
        </marker>
        <marker
          id="arrowhead-active"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={ACTIVE_COLOR} />
        </marker>
      </defs>

      {connections.map((conn) => (
        <ConnectionPath key={conn.id} connection={conn} nodes={nodes} />
      ))}

      {ui.connectionPending && (
        <PendingConnectionPath pending={ui.connectionPending} nodes={nodes} />
      )}
    </svg>
  );
}
