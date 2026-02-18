import type { Node } from "@/stores/flowStore";

// Helper to get handle coordinates
export const getHandleCoords = (nodeId: string, handlePos: string, nodes: Node[]) => {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return { x: 0, y: 0 };

  // Assuming fixed size for now or we need to track node dimensions in store
  const w = 280;
  const h = 100; // rough estimate, ideally dynamic
  const x = node.position.x;
  const y = node.position.y;

  switch (handlePos) {
    case "top":
      return { x: x + w / 2, y };
    case "right":
      return { x: x + w, y: y + h / 2 };
    case "bottom":
      return { x: x + w / 2, y: y + h };
    case "left":
      return { x, y: y + h / 2 };
    default:
      return { x, y };
  }
};
