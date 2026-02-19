import type { Position } from "../../types";
import type { CanvasTransform } from "./flowCanvasTypes";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_SENSITIVITY = 0.001;
export const ZOOM_STEP = 0.1;

export function isTextInput(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	return (
		target.tagName === "INPUT" ||
		target.tagName === "TEXTAREA" ||
		target.isContentEditable
	);
}

export function screenToCanvas(
	screenX: number,
	screenY: number,
	containerRect: DOMRect,
	transform: CanvasTransform,
): Position {
	return {
		x: (screenX - containerRect.left - transform.x) / transform.zoom,
		y: (screenY - containerRect.top - transform.y) / transform.zoom,
	};
}
