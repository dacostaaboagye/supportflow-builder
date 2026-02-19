import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import rawData from "../flow_data.json";
import type {
	AppMode,
	FlowConnection,
	FlowNode,
	HandleId,
	NodeData,
	NodeOption,
	NodeType,
	Position,
	RawFlowData,
	RawNode,
	RawNodeOption,
	UIState,
} from "../types";

export type {
	FlowConnection as Connection,
	FlowNode as Node,
	HandleId as HandlePosition,
	NodeData,
	NodeType,
} from "../types";

interface FlowState {
	nodes: FlowNode[];
	connections: FlowConnection[];
	selectedNodeId: string | null;
	mode: AppMode;
	ui: UIState;

	setNodes: (nodes: FlowNode[]) => void;
	addNode: (type: NodeType, position: Position) => void;
	updateNode: (id: string, data: Partial<NodeData>) => void;
	moveNode: (id: string, position: Position) => void;
	deleteNode: (id: string) => void;
	selectNode: (id: string | null) => void;

	addConnection: (connection: Omit<FlowConnection, "id">) => void;
	deleteConnection: (id: string) => void;
	setConnections: (connections: FlowConnection[]) => void;

	setMode: (mode: AppMode) => void;
	togglePalette: () => void;
	toggleEditor: () => void;
	setEditorOpen: (open: boolean) => void;
	setSelectedConnection: (id: string | null) => void;

	startConnection: (
		sourceId: string,
		sourceHandle: HandleId,
		mousePos: Position,
	) => void;
	updateConnectionMousePos: (mousePos: Position) => void;
	endConnection: () => void;
}

const flowData = rawData as RawFlowData;

const normaliseNodeType = (raw: string): NodeType =>
	raw === "choice" ? "choice" : "message";

const mapOption = (raw: RawNodeOption): NodeOption => ({
	id: raw.id ?? uuidv4(),
	label: raw.label,
	nextId: raw.nextId,
});

const initialNodes: FlowNode[] = flowData.nodes.map((node: RawNode) => ({
	id: node.id,
	type: normaliseNodeType(node.type),
	position: node.position ?? { x: 0, y: 0 },
	data: {
		label: node.data.label,
		content: node.data.content,
		options: node.data.options ? node.data.options.map(mapOption) : undefined,
	},
}));

function buildInitialConnections(nodes: FlowNode[]): FlowConnection[] {
	if (flowData.connections && flowData.connections.length > 0) {
		return flowData.connections.map((connection) => ({
			id: connection.id ?? uuidv4(),
			sourceId: connection.sourceId,
			targetId: connection.targetId,
			sourceHandle: connection.sourceHandle,
			targetHandle: connection.targetHandle,
		}));
	}

	const derivedConnections: FlowConnection[] = [];
	for (const node of nodes) {
		if (!node.data.options) continue;
		for (const option of node.data.options) {
			if (!option.nextId) continue;
			derivedConnections.push({
				id: uuidv4(),
				sourceId: node.id,
				targetId: option.nextId,
				sourceHandle: option.id,
				targetHandle: "left",
			});
		}
	}
	return derivedConnections;
}

const initialConnections = buildInitialConnections(initialNodes);

export const useFlowStore = create<FlowState>((set) => ({
	nodes: initialNodes,
	connections: initialConnections,
	selectedNodeId: null,
	mode: "editor",
	ui: {
		showPalette: false,
		showEditor: false,
		connectionPending: null,
		selectedConnectionId: null,
	},

	setNodes: (nodes) => set({ nodes }),

	addNode: (type, position) =>
		set((state) => {
			const newNode: FlowNode = {
				id: uuidv4(),
				type,
				position,
				data: {
					label: type === "message" ? "New Message" : "New Choice",
					content: "",
					options: type === "choice" ? [] : undefined,
				},
			};
			return {
				nodes: [...state.nodes, newNode],
				selectedNodeId: newNode.id,
				ui: { ...state.ui, showEditor: true },
			};
		}),

	updateNode: (id, data) =>
		set((state) => ({
			nodes: state.nodes.map((node) =>
				node.id === id ? { ...node, data: { ...node.data, ...data } } : node,
			),
		})),

	moveNode: (id, position) =>
		set((state) => ({
			nodes: state.nodes.map((node) =>
				node.id === id ? { ...node, position } : node,
			),
		})),

	deleteNode: (id) =>
		set((state) => ({
			nodes: state.nodes.filter((node) => node.id !== id),
			connections: state.connections.filter(
				(connection) =>
					connection.sourceId !== id && connection.targetId !== id,
			),
			selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
		})),

	selectNode: (id) =>
		set((state) => ({
			selectedNodeId: id,
			ui: {
				...state.ui,
				selectedConnectionId: id ? null : state.ui.selectedConnectionId,
			},
		})),

	addConnection: (connection) =>
		set((state) => ({
			connections: [...state.connections, { ...connection, id: uuidv4() }],
		})),

	deleteConnection: (id) =>
		set((state) => ({
			connections: state.connections.filter(
				(connection) => connection.id !== id,
			),
		})),

	setConnections: (connections) => set({ connections }),

	setMode: (mode) => set({ mode }),

	togglePalette: () =>
		set((state) => ({
			ui: { ...state.ui, showPalette: !state.ui.showPalette },
		})),

	toggleEditor: () =>
		set((state) => ({
			ui: { ...state.ui, showEditor: !state.ui.showEditor },
		})),

	setEditorOpen: (open) =>
		set((state) => ({
			ui: { ...state.ui, showEditor: open },
		})),

	setSelectedConnection: (id) =>
		set((state) => ({
			selectedNodeId: id ? null : state.selectedNodeId,
			ui: { ...state.ui, selectedConnectionId: id },
		})),

	startConnection: (sourceId, sourceHandle, mousePos) =>
		set((state) => ({
			ui: {
				...state.ui,
				connectionPending: { sourceId, sourceHandle, mousePos },
			},
		})),

	updateConnectionMousePos: (mousePos) =>
		set((state) => ({
			ui: {
				...state.ui,
				connectionPending: state.ui.connectionPending
					? { ...state.ui.connectionPending, mousePos }
					: null,
			},
		})),

	endConnection: () =>
		set((state) => ({
			ui: { ...state.ui, connectionPending: null },
		})),
}));
