import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import initialData from '../flow_data.json';

export type NodeType = 'message' | 'choice';
// export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';
export type HandlePosition = string;

export interface NodeData {
  label: string;
  content: string;
  options?: { id: string; label: string; nextId?: string }[];
}

export interface Node {
  id: string;
  type: NodeType;
  data: NodeData;
  position: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: HandlePosition;
  targetHandle: HandlePosition;
}

interface FlowState {
  nodes: Node[];
  connections: Connection[];
  selectedNodeId: string | null;
  mode: 'editor' | 'preview';
  ui: {
    showPalette: boolean;
    showEditor: boolean;
    connectionPending: {
      sourceId: string;
      sourceHandle: HandlePosition;
      mousePos: { x: number; y: number };
    } | null;
  };
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  moveNode: (id: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  
  addConnection: (connection: Omit<Connection, 'id'>) => void;
  deleteConnection: (id: string) => void;
  
  setMode: (mode: 'editor' | 'preview') => void;
  togglePalette: () => void;
  toggleEditor: () => void;
  setEditorOpen: (open: boolean) => void;
  
  startConnection: (sourceId: string, sourceHandle: HandlePosition, mousePos: { x: number; y: number }) => void;
  updateConnectionMousePos: (mousePos: { x: number; y: number }) => void;
  endConnection: () => void;
}

// ------------------------------------------------------------------
// Initial Data Loading
// ------------------------------------------------------------------
const initialNodes: Node[] = (initialData.nodes as any[]).map(n => ({
  id: n.id,
  type: n.type as NodeType,
  position: n.position || { x: 0, y: 0 },
  data: {
      label: n.data.label,
      content: n.data.content,
      options: n.data.options ? n.data.options.map((o: any) => ({...o, id: uuidv4()})) : undefined
  }
}));

const initialConnections: Connection[] = [];
initialNodes.forEach(node => {
  if (node.data.options) {
    node.data.options.forEach(opt => {
      if (opt.nextId) {
        initialConnections.push({
          id: uuidv4(),
          sourceId: node.id,
          targetId: opt.nextId,
          sourceHandle: opt.id, // Use Option ID as the handle ID for correct mapping
          targetHandle: 'left'
        });
      }
    });
  }
});

export const useFlowStore = create<FlowState>((set) => ({
  nodes: initialNodes,
  connections: initialConnections,
  selectedNodeId: null,
  mode: 'editor',
  ui: {
    showPalette: true,
    showEditor: true,
    connectionPending: null
  },

  setNodes: (nodes) => set({ nodes }),

  addNode: (type, position) => set((state) => {
    const newNode: Node = {
      id: uuidv4(),
      type,
      position,
      data: {
        label: type === 'message' ? 'New Message' : 'New Choice',
        content: '',
        options: type === 'choice' ? [] : undefined,
      },
    };
    return { nodes: [...state.nodes, newNode], selectedNodeId: newNode.id, ui: { ...state.ui, showEditor: true } }; // Auto-open editor
  }),

  updateNode: (id, data) => set((state) => ({
    nodes: state.nodes.map((node) => 
      node.id === id ? { ...node, data: { ...node.data, ...data } } : node
    ),
  })),

  moveNode: (id, position) => set((state) => ({
    nodes: state.nodes.map((node) => 
      node.id === id ? { ...node, position } : node
    ),
  })),

  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    connections: state.connections.filter((c) => c.sourceId !== id && c.targetId !== id),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
  })),

  selectNode: (id) => set((state) => ({ 
      selectedNodeId: id,
      ui: { ...state.ui, showEditor: !!id || state.ui.showEditor }
  })),

  addConnection: (connection) => set((state) => ({
    connections: [...state.connections, { ...connection, id: uuidv4() }],
  })),

  deleteConnection: (id) => set((state) => ({
    connections: state.connections.filter((c) => c.id !== id),
  })),

  setMode: (mode) => set({ mode }),
  
  togglePalette: () => set((state) => ({ ui: { ...state.ui, showPalette: !state.ui.showPalette } })),
  toggleEditor: () => set((state) => ({ ui: { ...state.ui, showEditor: !state.ui.showEditor } })),
  setEditorOpen: (open) => set((state) => ({ ui: { ...state.ui, showEditor: open } })),

  startConnection: (sourceId, sourceHandle, mousePos) => set((state) => ({
    ui: { ...state.ui, connectionPending: { sourceId, sourceHandle, mousePos } }
  })),

  updateConnectionMousePos: (mousePos) => set((state) => ({
    ui: { 
      ...state.ui, 
      connectionPending: state.ui.connectionPending ? { ...state.ui.connectionPending, mousePos } : null 
    }
  })),

  endConnection: () => set((state) => ({
    ui: { ...state.ui, connectionPending: null }
  })),
}));
