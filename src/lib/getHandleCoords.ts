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
  console.warn(`[getHandleCoords] DOM lookup failed for handle: nodeId=${nodeId}, handleId=${handleId}. Using fallback.`);
  return computeFallbackCoords(nodePosition, handleId);
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function measureHandleFromDOM(
  nodeId: string,
  nodePosition: Position,
  handleId: HandleId,
): Position | null {
  // Try exact match first
  let handleEl = document.getElementById(`handle-${nodeId}-${handleId}`);

  // For option handles (non-standard), try the right{handleId} pattern
  if (!handleEl && !STANDARD_POSITIONS.has(handleId)) {
    handleEl = document.getElementById(`handle-${nodeId}-right${handleId}`);
  }

  if (!handleEl) {
    console.warn(`[measureHandleFromDOM] Handle element not found: handle-${nodeId}-${handleId}`);
    return null;
  }

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
  const result = {
    x: nodePosition.x + screenOffsetX / scale,
    y: nodePosition.y + screenOffsetY / scale,
  };

  console.log(`[measureHandleFromDOM] ${handleEl.id}: nodePos=(${nodePosition.x},${nodePosition.y}), screen offset=(${screenOffsetX.toFixed(1)},${screenOffsetY.toFixed(1)}), scale=${scale.toFixed(3)}, result=(${result.x.toFixed(1)},${result.y.toFixed(1)})`);

  return result;
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
