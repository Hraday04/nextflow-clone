import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  executeNode: (id: string) => void;
  executeAll: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],

  // Handlers required by React Flow to handle structural canvas changes inherently
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  // Custom utilities for standard interactions
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => {
    set({ nodes: typeof nodes === "function" ? nodes(get().nodes) : nodes });
  },

  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => {
    set({ edges: typeof edges === "function" ? edges(get().edges) : edges });
  },

  addNode: (node: Node) => {
    set({ nodes: [...get().nodes, node] });
  },

  updateNodeData: (nodeId: string, newData: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
    });
  },

  executeNode: (id: string) => {
    set((state: any) => {
      // Find the node and mark as running (or trigger your node logic here)
      const nodes = state.nodes.map((node: any) =>
        node.id === id
          ? { ...node, data: { ...node.data, status: "running" } }
          : node,
      );
      // Optionally: trigger actual node execution logic here
      return { ...state, nodes };
    });
  },

  executeAll: () => {
    set((state: any) => {
      const nodes = state.nodes.map((node: any) => ({
        ...node,
        data: { ...node.data, status: "running" },
      }));
      // Optionally: trigger actual execution logic for all nodes here
      return { ...state, nodes };
    });
  },
}));
