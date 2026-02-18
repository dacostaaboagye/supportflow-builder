import React, { useRef, useState, useCallback, useEffect } from "react";
import { useFlowStore } from "../../stores/flowStore";
import { DraggableNode } from "./DraggableNode";
import { ConnectionLayer } from "./ConnectionLayer";
import { cn } from "../../lib/utils";

export function FlowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const { nodes, selectNode } = useFlowStore();

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Zoom logic
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        const newZoom = Math.min(
          Math.max(transform.zoom - e.deltaY * zoomSensitivity, 0.1),
          5,
        );
        setTransform((prev) => ({ ...prev, zoom: newZoom }));
      } else {
        // Pan logic if no modifier
        setTransform((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [transform.zoom],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle mouse or Space+LeftClick to pan
    if (
      e.button === 1 ||
      (e.button === 0 && e.nativeEvent.getModifierState("Space"))
    ) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    } else if (e.target === containerRef.current) {
      // Deselect if clicking on empty canvas
      selectNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Prevent default browser zoom behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };

    container.addEventListener("wheel", preventDefault, { passive: false });
    return () => container.removeEventListener("wheel", preventDefault);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full overflow-hidden bg-canvas-bg relative cursor-default",
        isPanning && "cursor-grabbing",
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Transform Container */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <ConnectionLayer />

        {nodes.map((node) => (
          <DraggableNode key={node.id} node={node} zoom={transform.zoom} />
        ))}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-4 left-4 bg-surface p-2 rounded-md shadow-md border border-border flex gap-2 items-center">
        <button
          className="px-2 py-1 hover:bg-surface-hover rounded text-text-main"
          onClick={() => setTransform((t) => ({ ...t, zoom: t.zoom - 0.1 }))}
        >
          -
        </button>
        <span className="text-sm font-mono flex items-center min-w-[3ch] justify-center">
          {Math.round(transform.zoom * 100)}%
        </span>
        <button
          className="px-2 py-1 hover:bg-surface-hover rounded text-text-main"
          onClick={() => setTransform((t) => ({ ...t, zoom: t.zoom + 0.1 }))}
        >
          +
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          className="px-3 py-1 bg-primary text-primary-foreground hover:bg-primary-hover rounded text-sm font-medium flex items-center gap-1 shadow-sm transition-colors"
          onClick={() => useFlowStore.getState().setMode("preview")}
        >
          ▶ Run
        </button>
      </div>
    </div>
  );
}
