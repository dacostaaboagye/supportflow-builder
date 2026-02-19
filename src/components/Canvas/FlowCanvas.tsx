import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useFlowStore } from "../../stores/flowStore";
import type { NodeType, Position } from "../../types";
import { CanvasControls } from "./CanvasControls";
import { ConnectionLayer } from "./ConnectionLayer";
import { DraggableNode } from "./DraggableNode";
import type { CanvasTransform } from "../../lib/canvas-utils/flowCanvasTypes";
import {
  isTextInput,
  MAX_ZOOM,
  MIN_ZOOM,
  screenToCanvas,
  ZOOM_SENSITIVITY,
  ZOOM_STEP,
} from "../../lib/canvas-utils/flowCanvasUtils";

export function FlowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });

  const [transform, setTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const { nodes, selectNode, setSelectedConnection } = useFlowStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTextInput(e.target)) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpacePressed(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const { clientX, clientY, deltaX, deltaY, ctrlKey, metaKey } = e;

    if (ctrlKey || metaKey) {
      e.preventDefault();
      setTransform((prev) => {
        const newZoom = Math.min(
          Math.max(prev.zoom - deltaY * ZOOM_SENSITIVITY, MIN_ZOOM),
          MAX_ZOOM,
        );
        if (!containerRef.current) return { ...prev, zoom: newZoom };

        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;
        return {
          x: offsetX - (offsetX - prev.x) * (newZoom / prev.zoom),
          y: offsetY - (offsetY - prev.y) * (newZoom / prev.zoom),
          zoom: newZoom,
        };
      });
    } else {
      setTransform((prev) => ({
        ...prev,
        x: prev.x - deltaX,
        y: prev.y - deltaY,
      }));
    }
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const shouldPan = e.button === 1 || (e.button === 0 && isSpacePressed);

      if (shouldPan) {
        e.preventDefault();
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      } else if (
        e.target === containerRef.current ||
        e.target === contentRef.current
      ) {
        selectNode(null);
        setSelectedConnection(null);
      }
    },
    [isSpacePressed, selectNode, setSelectedConnection],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }

      const { ui, updateConnectionMousePos } = useFlowStore.getState();
      if (ui.connectionPending && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        updateConnectionMousePos(
          screenToCanvas(e.clientX, e.clientY, rect, transform),
        );
      }
    },
    [isPanning, transform],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    const { ui, endConnection } = useFlowStore.getState();
    if (ui.connectionPending) endConnection();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prevent = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    container.addEventListener("wheel", prevent, { passive: false });
    return () => container.removeEventListener("wheel", prevent);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow") as
        | NodeType
        | "";
      if (!type) return;

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const position = screenToCanvas(e.clientX, e.clientY, rect, transform);
        useFlowStore.getState().addNode(type as NodeType, position);
      }
    },
    [transform],
  );

  const handleZoomIn = useCallback(
    () =>
      setTransform((t) => ({
        ...t,
        zoom: Math.min(t.zoom + ZOOM_STEP, MAX_ZOOM),
      })),
    [],
  );
  const handleZoomOut = useCallback(
    () =>
      setTransform((t) => ({
        ...t,
        zoom: Math.max(t.zoom - ZOOM_STEP, MIN_ZOOM),
      })),
    [],
  );
  const handleRun = useCallback(
    () => useFlowStore.getState().setMode("preview"),
    [],
  );

  return (
    <div
      ref={containerRef}
      role="application"
      className={cn(
        "w-full h-full overflow-hidden bg-canvas-bg canvas-dot-grid relative cursor-default",
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
      <div
        ref={contentRef}
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

      <CanvasControls
        zoom={transform.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRun={handleRun}
      />
    </div>
  );
}
