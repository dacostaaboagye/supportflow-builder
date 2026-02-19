import type { HandleId, Position, StandardHandlePosition } from "../types";

const STANDARD_POSITIONS = new Set<string>(["top", "right", "bottom", "left"]);
const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 150;

export function getHandleCoords(
	nodeId: string,
	nodePosition: Position,
	handleId: HandleId,
): Position {
	const domCoords = measureHandleFromDOM(nodeId, nodePosition, handleId);
	if (domCoords) return domCoords;
	return computeFallbackCoords(nodePosition, handleId);
}

function measureHandleFromDOM(
	nodeId: string,
	nodePosition: Position,
	handleId: HandleId,
): Position | null {
	let handleEl = document.getElementById(`handle-${nodeId}-${handleId}`);

	if (!handleEl && !STANDARD_POSITIONS.has(handleId)) {
		handleEl = document.getElementById(`handle-${nodeId}-right${handleId}`);
	}

	if (!handleEl) return null;

	const nodeEl = document.getElementById(nodeId);
	if (!nodeEl) return null;

	const nodeRect = nodeEl.getBoundingClientRect();
	const handleRect = handleEl.getBoundingClientRect();
	const scale =
		nodeEl.offsetWidth > 0 ? nodeRect.width / nodeEl.offsetWidth : 1;

	const screenOffsetX = handleRect.left - nodeRect.left + handleRect.width / 2;
	const screenOffsetY = handleRect.top - nodeRect.top + handleRect.height / 2;

	return {
		x: nodePosition.x + screenOffsetX / scale,
		y: nodePosition.y + screenOffsetY / scale,
	};
}

function computeFallbackCoords(
	nodePosition: Position,
	handleId: HandleId,
): Position {
	const { x, y } = nodePosition;
	const w = DEFAULT_NODE_WIDTH;
	const h = DEFAULT_NODE_HEIGHT;

	switch (handleId as StandardHandlePosition) {
		case "top":
			return { x: x + w / 2, y };
		case "right":
			return { x: x + w, y: y + h / 2 };
		case "bottom":
			return { x: x + w / 2, y: y + h };
		case "left":
			return { x, y: y + h / 2 };
		default:
			return { x: x + w, y: y + 40 };
	}
}
