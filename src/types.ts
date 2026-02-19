// ---------------------------------------------------------------------------
// Shared Types — single source of truth for the entire application
// ---------------------------------------------------------------------------

/** 2-D coordinate used for node positions and mouse tracking. */
export interface Position {
  x: number;
  y: number;
}

// ---- Handle Types ---------------------------------------------------------

/** The four cardinal positions for standard connection handles. */
export type StandardHandlePosition = "top" | "right" | "bottom" | "left";

/**
 * A handle identifier.
 * Standard handles use a `StandardHandlePosition` value.
 * Option handles use the option's UUID string.
 */
export type HandleId = StandardHandlePosition | (string & {});

/** Whether a handle acts as the start or end of a connection. */
export type HandleType = "source" | "target";

// ---- Node Types -----------------------------------------------------------

/** Supported visual node types on the canvas. */
export type NodeType = "message" | "choice";

/** A single selectable option within a Choice node. */
export interface NodeOption {
  id: string;
  label: string;
  /** @deprecated — kept only for legacy JSON compatibility. */
  nextId?: string;
}

/** The user-editable payload within each node. */
export interface NodeData {
  label: string;
  content: string;
  options?: NodeOption[];
}

/** A single node on the canvas. */
export interface FlowNode {
  id: string;
  type: NodeType;
  data: NodeData;
  position: Position;
}

// ---- Connection Types -----------------------------------------------------

/** A directed edge between two node handles. */
export interface FlowConnection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: HandleId;
  targetHandle: HandleId;
}

// ---- Connection Pending ---------------------------------------------------

/** Transient state while the user is drawing a new connection. */
export interface ConnectionPending {
  sourceId: string;
  sourceHandle: HandleId;
  mousePos: Position;
}

// ---- UI State -------------------------------------------------------------

export interface UIState {
  showPalette: boolean;
  showEditor: boolean;
  connectionPending: ConnectionPending | null;
}

/** The two top-level application modes. */
export type AppMode = "editor" | "preview";

// ---- Raw JSON shape (for parsing flow_data.json) --------------------------

export interface RawNodeOption {
  id?: string;
  label: string;
  nextId?: string;
}

export interface RawNodeData {
  label: string;
  content: string;
  options?: RawNodeOption[];
}

export interface RawNode {
  id: string;
  type: string;
  data: RawNodeData;
  position?: Position;
}

export interface RawConnection {
  id?: string;
  sourceId: string;
  targetId: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface RawFlowData {
  nodes: RawNode[];
  connections?: RawConnection[];
  rootId?: string;
}
