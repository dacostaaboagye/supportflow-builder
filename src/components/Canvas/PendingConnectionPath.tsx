import { getHandleCoords } from "../../lib/getHandleCoords";
import type { ConnectionPending, FlowNode } from "../../types";
import { ACTIVE_COLOR, buildBezierD } from "./connectionLayerUtils";

interface PendingConnectionPathProps {
	pending: ConnectionPending;
	nodes: FlowNode[];
	activeMarkerId: string;
}

export function PendingConnectionPath({
	pending,
	nodes,
	activeMarkerId,
}: Readonly<PendingConnectionPathProps>) {
	const sourceNode = nodes.find((n) => n.id === pending.sourceId);
	if (!sourceNode) return null;

	const from = getHandleCoords(
		pending.sourceId,
		sourceNode.position,
		pending.sourceHandle,
	);

	return (
		<path
			d={buildBezierD(from, pending.mousePos)}
			stroke={ACTIVE_COLOR}
			strokeWidth="2"
			fill="none"
			strokeDasharray="5,5"
			markerEnd={`url(#${activeMarkerId})`}
			className="animate-pulse"
		/>
	);
}
