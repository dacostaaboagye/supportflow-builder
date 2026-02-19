import type { Position } from "../../types";

export const CONNECTOR_COLOR = "var(--color-connector)";
export const ACTIVE_COLOR = "var(--color-primary)";
export const DELETE_COLOR = "#ef4444";

export function buildBezierD(from: Position, to: Position): string {
	const dist = Math.abs(to.x - from.x);
	const controlOffset = Math.max(dist * 0.5, 50);
	return `M ${from.x} ${from.y} C ${from.x + controlOffset} ${from.y}, ${
		to.x - controlOffset
	} ${to.y}, ${to.x} ${to.y}`;
}

export function bezierMidpoint(from: Position, to: Position): Position {
	return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
}
