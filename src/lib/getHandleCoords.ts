import type { HandleId, Position, StandardHandlePosition } from '../types';

const STANDARD_POSITIONS = new Set<string>(['top', 'right', 'bottom', 'left']);
const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 150;

/**
 * Calculate canvas-space coordinates for a node handle.
 *
 * Tries to measure the actual DOM element first; falls back to defaults
 * when elements are not yet mounted.
 */
export function getHandleCoords(
  nodeId: string,
  nodePosition: Position,
  handleId: HandleId,
): Position {
  // 1. Try DOM measurement for exact positioning
  const domCoords = measureHandleFromDOM(nodeId, nodePosition, handleId);
  if (domCoords) return domCoords;

  // 2. Fallback for standard positions using default dimensions
  return computeFallbackCoords(nodePosition, handleId);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Locate the handle element in the DOM and compute its canvas-space centre
 * point. Uses the ratio between unscaled and scaled element dimensions to
 * account for the canvas zoom level.
 */
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

  // getBoundingClientRect returns screen-space values (scaled by zoom).
  // Derive the current zoom from the node element so we can convert back.
  const scale = nodeEl.offsetWidth > 0 ? nodeRect.width / nodeEl.offsetWidth : 1;

  // Screen-space offset from the node's top-left to the handle centre.
  const screenOffsetX = handleRect.left - nodeRect.left + handleRect.width / 2;
  const screenOffsetY = handleRect.top - nodeRect.top + handleRect.height / 2;

  // Convert to canvas-space and add to the node's stored position.
  return {
    x: nodePosition.x + screenOffsetX / scale,
    y: nodePosition.y + screenOffsetY / scale,
  };
}

/**
 * Produce an approximate handle position when the DOM is not yet available.
 */
function computeFallbackCoords(
  nodePosition: Position,
  handleId: HandleId,
): Position {
  const { x, y } = nodePosition;
  const w = DEFAULT_NODE_WIDTH;
  const h = DEFAULT_NODE_HEIGHT;

  switch (handleId as StandardHandlePosition) {
    case 'top':
      return { x: x + w / 2, y };
    case 'right':
      return { x: x + w, y: y + h / 2 };
    case 'bottom':
      return { x: x + w / 2, y: y + h };
    case 'left':
      return { x, y: y + h / 2 };
    default:
      // Non-standard handle (option) — approximate on the right edge
      return { x: x + w, y: y + 40 };
  }
}
