import React, { useRef, useState, useEffect, useCallback } from "react";
import { useFlowStore } from "../../stores/flowStore";
import { DraggableNode } from "./DraggableNode";
import { ConnectionLayer } from "./ConnectionLayer";
import { cn } from "../../lib/utils";
import type { NodeType, Position } from "../../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CanvasTransform {
  x: number;
  y: number;
  zoom: number;
}

// ---------------------------------------------------------------------------
// Sub-component: zoom / run controls overlay
// ---------------------------------------------------------------------------

interface CanvasControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRun: () => void;
}

function CanvasControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onRun,
}: CanvasControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 glass-panel p-1.5 rounded-xl shadow-float flex gap-1 items-center">
      <button
        className="w-8 h-8 flex items-center justify-center hover:bg-surface-muted rounded-lg text-text-muted hover:text-text-main transition-smooth font-medium"
        onClick={onZoomOut}
      >
        −
      </button>
      <span className="text-xs font-mono text-text-muted flex items-center min-w-[4ch] justify-center tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <button
        className="w-8 h-8 flex items-center justify-center hover:bg-surface-muted rounded-lg text-text-muted hover:text-text-main transition-smooth font-medium"
        onClick={onZoomIn}
      >
        +
      </button>

      <div className="w-px h-5 bg-border mx-0.5" />

      <button
        className="px-3 h-8 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-smooth"
        onClick={onRun}
      >
        <span className="text-[10px]">▶</span> Run
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_SENSITIVITY = 0.001;
const ZOOM_STEP = 0.1;

/** Returns true if the keyboard event target is a text-entry element. */
function isTextInput(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

/** Convert screen coordinates to canvas-space coordinates. */
function screenToCanvas(
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

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function FlowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef<Position>({ x: 0, y: 0 });

  const [transform, setTransform] = useState<CanvasTransform>({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const { nodes, selectNode } = useFlowStore();

  // -- Space key for panning ------------------------------------------------

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

  // -- Wheel: zoom with Ctrl/Cmd, otherwise pan ----------------------------

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

  // -- Mouse down: start panning or deselect --------------------------------

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const shouldPan = e.button === 1 || (e.button === 0 && isSpacePressed);

      if (shouldPan) {
        e.preventDefault();
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      } else if (e.target === containerRef.current) {
        selectNode(null);
      }
    },
    [isSpacePressed, selectNode],
  );

  // -- Mouse move: pan + connection drawing ---------------------------------

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

  // -- Mouse up: stop panning / cancel connection ---------------------------

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    const { ui, endConnection } = useFlowStore.getState();
    if (ui.connectionPending) endConnection();
  }, []);

  // -- Prevent browser zoom on canvas ---------------------------------------

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prevent = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    container.addEventListener("wheel", prevent, { passive: false });
    return () => container.removeEventListener("wheel", prevent);
  }, []);

  // -- Drag & drop: create new nodes ----------------------------------------

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

  // -- Zoom callbacks for controls ------------------------------------------

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

  // -- Render ---------------------------------------------------------------

  return (
    <div
      ref={containerRef}
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
