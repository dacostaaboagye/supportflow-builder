import React, { useRef, useState, useEffect, useCallback } from "react";
import { useFlowStore } from "../../stores/flowStore";
import { DraggableNode } from "./DraggableNode";
import { ConnectionLayer } from "./ConnectionLayer";
import { cn } from "../../lib/utils";

export function FlowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const [transform, setTransform] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const { nodes, selectNode } = useFlowStore();

  // Track Space key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Wheel: zoom with Ctrl/Cmd, otherwise pan
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const { clientX, clientY, deltaX, deltaY, ctrlKey, metaKey } = e;

    if (ctrlKey || metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.001;

      setTransform((prev) => {
        const newZoom = Math.min(
          Math.max(prev.zoom - deltaY * zoomSensitivity, 0.1),
          5,
        );

        // Optional: zoom around cursor
        if (!containerRef.current) return { ...prev, zoom: newZoom };
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;

        const dx = offsetX - (offsetX - prev.x) * (newZoom / prev.zoom);
        const dy = offsetY - (offsetY - prev.y) * (newZoom / prev.zoom);

        return { x: dx, y: dy, zoom: newZoom };
      });
    } else {
      // Regular pan
      setTransform((prev) => ({
        ...prev,
        x: prev.x - deltaX,
        y: prev.y - deltaY,
      }));
    }
  }, []);

  // Mouse down: start panning or deselect
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const isPan = e.button === 1 || (e.button === 0 && isSpacePressed);

      if (isPan) {
        e.preventDefault();
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      } else if (e.target === containerRef.current) {
        selectNode(null);
      }
    },
    [isSpacePressed, selectNode],
  );

  // Mouse move: pan
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    },
    [isPanning],
  );

  // Mouse up: stop panning
  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  // Prevent browser zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };

    container.addEventListener("wheel", preventDefault, { passive: false });
    return () => container.removeEventListener("wheel", preventDefault);
  }, []);

  // Drag over: allow drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Drop: create new node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow") as
        | "message"
        | "choice";

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // Calculate position
      // We need to convert screen coordinates (event.clientX/Y) to canvas coordinates
      // taking into account the transform (x, y, zoom)
      if (containerRef.current) {
        const reactFlowBounds = containerRef.current.getBoundingClientRect();
        const position = {
          x:
            (event.clientX - reactFlowBounds.left - transform.x) /
            transform.zoom,
          y:
            (event.clientY - reactFlowBounds.top - transform.y) /
            transform.zoom,
        };

        useFlowStore.getState().addNode(type, position);
      }
    },
    [transform],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full overflow-hidden bg-canvas-bg relative cursor-default",
        isSpacePressed && !isPanning && "cursor-grab",
        isPanning && "cursor-grabbing",
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDragOver={onDragOver}
      onDrop={onDrop}
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
