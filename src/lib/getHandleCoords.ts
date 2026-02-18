import type { Node } from "@/stores/flowStore";

// Helper to get handle coordinates
export const getHandleCoords = (nodeId: string, transformPos: { x: number; y: number }, handlePos: string) => {
  // Try to find the specific handle element first!
  // Our naming convention in DraggableNode:
  // Standard: `handle-${nodeId}-${handlePos}`
  // Option: `handle-${nodeId}-right${handlePos}` (Wait, I used `handle-${node.id}-${position}${idSuffix}`)
  // Let's verify DraggableNode logic:
  // renderHandle(..., position, ..., idSuffix) -> id={`handle-${node.id}-${position}${idSuffix}`}
  //
  // For standard: position='right', idSuffix='' -> `handle-123-right`
  // For option: position='right', idSuffix='opt-1' -> `handle-123-rightopt-1`
  
  // So if handlePos is 'opt-1', we need to check if there is an element with ID `handle-nodeId-rightopt-1`?
  // No, the store saves `sourceHandle` as just the ID suffix if it's an option?
  // In DraggableNode: `const sourceHandleId = idSuffix ? idSuffix : position;`
  // So for option, `sourceHandle` is the Option ID (e.g., uuid).
  // The ID in DOM is `handle-${node.id}-right${opt.id}`.
  
  // So checking logic:
  // Is handlePos one of standard 'top','left','right','bottom'?
  // If yes, look for `handle-${nodeId}-${handlePos}`.
  // If no, it's likely an option ID. Look for `handle-${nodeId}-right${handlePos}`.

  let handleEl = document.getElementById(`handle-${nodeId}-${handlePos}`);
  
  // If not found, try assuming it's an option on the right
  if (!handleEl) {
     handleEl = document.getElementById(`handle-${nodeId}-right${handlePos}`);
  }

  if (handleEl) {
      const rect = handleEl.getBoundingClientRect();
       // We need to return coords relative to the transformed canvas?
       // `transformPos` passed here is the Node's position in canvas space.
       // `getHandleCoords` traditionally returned canvas-space coords.
       
       // If we have the handle's screen rect, and we know the canvas transform...
       // We don't have the canvas transform here directly!
       // But wait, `DraggableNode` renders handles relative to the node.
       // The node is at `transformPos`.
       // So we can calculate the offset of the handle relative to the node's top-left.
       
       const nodeEl = document.getElementById(nodeId);
       if (nodeEl) {
           const nodeRect = nodeEl.getBoundingClientRect();
           const handleRect = rect; // Handle screen rect
           
           // Offset from node
           const offsetX = handleRect.left - nodeRect.left + (handleRect.width / 2);
           const offsetY = handleRect.top - nodeRect.top + (handleRect.height / 2);
           
           // Apply to canvas node position
           return {
               x: transformPos.x + offsetX,
               y: transformPos.y + offsetY
           };
       }
  }

  // Fallback (approximate) if DOM not found (e.g. loading)
  let w = 280;
  let h = 150;
  // ... (fallback logic) ...
  const { x, y } = transformPos;
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
      return { x: x + w, y: y + 40 }; // Default to somewhere on right
  }
};
