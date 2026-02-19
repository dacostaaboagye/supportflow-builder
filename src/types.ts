export interface Position {
	x: number;
	y: number;
}

export type StandardHandlePosition = "top" | "right" | "bottom" | "left";
export type HandleId = StandardHandlePosition | (string & {});
export type HandleType = "source" | "target";

export type NodeType = "message" | "choice";

export interface NodeOption {
	id: string;
	label: string;
	nextId?: string;
}

export interface NodeData {
	label: string;
	content: string;
	options?: NodeOption[];
}

export interface FlowNode {
	id: string;
	type: NodeType;
	data: NodeData;
	position: Position;
}

export interface FlowConnection {
	id: string;
	sourceId: string;
	targetId: string;
	sourceHandle: HandleId;
	targetHandle: HandleId;
}

export interface ConnectionPending {
	sourceId: string;
	sourceHandle: HandleId;
	mousePos: Position;
}

export interface UIState {
	showPalette: boolean;
	showEditor: boolean;
	connectionPending: ConnectionPending | null;
	selectedConnectionId: string | null;
}

export type AppMode = "editor" | "preview";

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
