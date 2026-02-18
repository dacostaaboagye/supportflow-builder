import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import rawData from '../flow_data.json';
import type {
  FlowNode,
  FlowConnection,
  NodeData,
  NodeOption,
  NodeType,
  HandleId,
  Position,
  AppMode,
  UIState,
  RawFlowData,
  RawNode,
  RawNodeOption,
} from '../types';

// Re-export types that other files depend on (backward compatibility)
export type { FlowNode as Node, FlowConnection as Connection } from '../types';
export type { NodeData, NodeType } from '../types';
export type { HandleId as HandlePosition } from '../types';

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------

interface FlowState {
  nodes: FlowNode[];
  connections: FlowConnection[];
  selectedNodeId: string | null;
  mode: AppMode;
  ui: UIState;

  // Node actions
  setNodes: (nodes: FlowNode[]) => void;
  addNode: (type: NodeType, position: Position) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  moveNode: (id: string, position: Position) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;

  // Connection actions
  addConnection: (connection: Omit<FlowConnection, 'id'>) => void;
  deleteConnection: (id: string) => void;
  setConnections: (connections: FlowConnection[]) => void;

  // UI actions
  setMode: (mode: AppMode) => void;
  togglePalette: () => void;
  toggleEditor: () => void;
  setEditorOpen: (open: boolean) => void;

  // Connection-drawing actions
  startConnection: (sourceId: string, sourceHandle: HandleId, mousePos: Position) => void;
  updateConnectionMousePos: (mousePos: Position) => void;
  endConnection: () => void;
}

// ---------------------------------------------------------------------------
// Initial data — parse raw JSON with proper types
// ---------------------------------------------------------------------------

const flowData = rawData as RawFlowData;

/** Normalise the JSON node type to one of our allowed types. */
const normaliseNodeType = (raw: string): NodeType =>
  raw === 'choice' ? 'choice' : 'message';

const mapOption = (raw: RawNodeOption): NodeOption => ({
  id: uuidv4(),
  label: raw.label,
  nextId: raw.nextId,
});

const initialNodes: FlowNode[] = flowData.nodes.map((n: RawNode) => ({
  id: n.id,
  type: normaliseNodeType(n.type),
  position: n.position ?? { x: 0, y: 0 },
  data: {
    label: n.data.label,
    content: n.data.content,
    options: n.data.options ? n.data.options.map(mapOption) : undefined,
  },
}));

const initialConnections: FlowConnection[] = [];
for (const node of initialNodes) {
  if (!node.data.options) continue;
  for (const opt of node.data.options) {
    if (opt.nextId) {
      initialConnections.push({
        id: uuidv4(),
        sourceId: node.id,
        targetId: opt.nextId,
        sourceHandle: opt.id,
        targetHandle: 'left',
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useFlowStore = create<FlowState>((set) => ({
  nodes: initialNodes,
  connections: initialConnections,
  selectedNodeId: null,
  mode: 'editor',
  ui: {
    showPalette: true,
    showEditor: true,
    connectionPending: null,
  },

  setNodes: (nodes) => set({ nodes }),

  addNode: (type, position) =>
    set((state) => {
      const newNode: FlowNode = {
        id: uuidv4(),
        type,
        position,
        data: {
          label: type === 'message' ? 'New Message' : 'New Choice',
          content: '',
          options: type === 'choice' ? [] : undefined,
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
        (c) => c.sourceId !== id && c.targetId !== id,
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  selectNode: (id) =>
    set((state) => ({
      selectedNodeId: id,
      ui: { ...state.ui, showEditor: !!id || state.ui.showEditor },
    })),

  addConnection: (connection) =>
    set((state) => ({
      connections: [...state.connections, { ...connection, id: uuidv4() }],
    })),

  deleteConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
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

  startConnection: (sourceId, sourceHandle, mousePos) =>
    set((state) => ({
      ui: { ...state.ui, connectionPending: { sourceId, sourceHandle, mousePos } },
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
