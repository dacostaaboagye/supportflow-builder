import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import initialData from '../flow_data.json';

export type NodeType = 'message' | 'choice';
export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';

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
          sourceHandle: 'right', // Default flow direction
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
    return { nodes: [...state.nodes, newNode], selectedNodeId: newNode.id };
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

  selectNode: (id) => set({ selectedNodeId: id }),

  addConnection: (connection) => set((state) => ({
    connections: [...state.connections, { ...connection, id: uuidv4() }],
  })),

  deleteConnection: (id) => set((state) => ({
    connections: state.connections.filter((c) => c.id !== id),
  })),

  setMode: (mode) => set({ mode }),
}));
