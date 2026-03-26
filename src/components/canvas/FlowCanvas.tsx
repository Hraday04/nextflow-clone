"use client";

import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Node,
  Edge,
  ConnectionLineType,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import TextNode from "./nodes/TextNode";
import ImageNode from "./nodes/ImageNode";
import LLMNode from "./nodes/LLMNode";
import VideoNode from "./nodes/VideoNode";
import FrameNode from "./nodes/FrameNode";
import CropNode from "./nodes/CropNode";
import { useFlowStore } from "@/store/flowStore";
import { UserButton } from "@clerk/nextjs";
import RunHistoryPanel from "./RunHistoryPanel";
import { Sidebar } from "./Sidebar";
import { runAI } from "../../lib/gemini";
import { Play, PlayCircle } from "lucide-react";

// 🔥 DAG EXECUTION ENGINE
const getInputs = (nodeId: string, edges: Edge[], results: any) => {
  const incoming = edges.filter((e) => e.target === nodeId);
  const inputs: any = {};
  incoming.forEach((edge) => {
    inputs[edge.source] = results[edge.source];
  });
  return inputs;
};

const topoSort = (nodes: Node[], edges: Edge[]) => {
  const inDegree: any = {};
  const graph: any = {};
  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    graph[n.id] = [];
  });
  edges.forEach((e) => {
    graph[e.source].push(e.target);
    inDegree[e.target]++;
  });
  const queue: string[] = [];
  Object.keys(inDegree).forEach((id) => {
    if (inDegree[id] === 0) queue.push(id);
  });
  const order: string[] = [];
  while (queue.length) {
    const curr = queue.shift()!;
    order.push(curr);
    graph[curr].forEach((neighbor: string) => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    });
  }
  return order;
};

const nodeTypes = {
  textNode: TextNode,
  imageNode: ImageNode,
  llmNode: LLMNode,
  videoNode: VideoNode,
  frameNode: FrameNode,
  cropNode: CropNode,
};

export default function FlowCanvas(props: any) {
  const nodes = useFlowStore((state) => state.nodes);
  const executeNode = useFlowStore((state) => state.executeNode);
  const executeAll = useFlowStore((state) => state.executeAll);
  const selected = nodes.find((n: any) => n.selected);

  const handleRunSelected = () => {
    if (selected && executeNode) {
      executeNode(selected.id);
    }
  };

  const handleRunAll = () => {
    if (executeAll) {
      executeAll();
    } else if (executeNode) {
      nodes.forEach((n: any) => executeNode(n.id));
    }
  };

  const {
    nodes: flowNodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useFlowStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const nodesRef = useRef(flowNodes);
  const edgesRef = useRef(edges);

  React.useEffect(() => {
    nodesRef.current = flowNodes;
    edgesRef.current = edges;
  }, [flowNodes, edges]);

  // 🎯 AUTO-SPREAD
  const getRandomPosition = () => ({
    x: Math.random() * 600,
    y: Math.random() * 400,
  });

  // Initialize nodes only once safely
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const addNode = useCallback(
    (type: string) => {
      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position: getRandomPosition(),
        data: { value: type === "llmNode" ? { output: "" } : null },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, value: newData } };
          }
          return node;
        }),
      );
    },
    [setNodes],
  );

  // 🔥 SAVE FLOW
  const saveFlow = async () => {
    try {
      const flow = { nodes: flowNodes, edges };
      const res = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ definition: flow }),
      });
      if (!res.ok) throw new Error("Failed to save flow");
      alert("Flow saved to PostgreSQL!");
    } catch (err) {
      console.error(err);
      alert("Error saving flow");
    }
  };

  // 🔥 LOAD FLOW
  const loadFlow = async () => {
    try {
      const res = await fetch("/api/workflow");
      if (!res.ok) {
        alert("No saved flow found in database");
        return;
      }
      const data = await res.json();
      const flow = data.definition; // Already an object
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      alert("Flow loaded from PostgreSQL!");
    } catch (err) {
      console.error(err);
      alert("Error loading flow");
    }
  };

  // 🔥 EXPORT FLOW
  const exportFlow = () => {
    const data = { nodes: flowNodes, edges };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
  };

  const importFlow = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.nodes || !data.edges) {
        alert("Invalid file format");
        return;
      }
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to import file");
    }
  };

  // 🔥 RUN LLM (MULTIMODAL FIX)
  const executeNodeFn = async (node: Node, inputs: any) => {
    switch (node.type) {
      case "textNode":
        return node.data?.value;

      case "llmNode": {
        let prompt = "";
        let imageBase64 = "";
        let mimeType = "image/png";

        // We use a for-of loop because we need to await async fetch operations possibly
        for (const val of Object.values(inputs)) {
          if (!val) continue;

          // EXTRACT TEXT (From Text Nodes, or outputs of LLM Nodes)
          let textFound = "";
          if (typeof val === "string") {
            // Prevent using URLs as text prompt
            if (
              !val.startsWith("http") &&
              !val.startsWith("data:") &&
              !val.startsWith("blob:")
            ) {
              textFound = val;
            }
          } else if (val && typeof val === "object") {
            const valObj = val as any;
            if (typeof valObj.text === "string") textFound = valObj.text;
            else if (
              typeof valObj.output === "string" &&
              !valObj.output.startsWith("http") &&
              !valObj.output.startsWith("data:")
            )
              textFound = valObj.output;
            else if (
              typeof valObj.value === "string" &&
              !valObj.value.startsWith("http") &&
              !valObj.value.startsWith("data:") &&
              !valObj.value.startsWith("blob:")
            )
              textFound = valObj.value;
          }

          if (textFound && typeof textFound === "string") {
            prompt += textFound + "\n";
          }

          // EXTRACT IMAGE OR VIDEO (from Image, Map, Frame, Video, or Crop nodes)
          if (val && (typeof val === "object" || typeof val === "string")) {
            const valObj = typeof val === "object" ? (val as any) : {};
            // Check if it's a direct URL string
            const isStringUrl =
              typeof val === "string" &&
              (val.startsWith("http") ||
                val.startsWith("data:") ||
                val.startsWith("blob:"));

            // Base64 extractions (usually from Crop or Frame nodes)
            const base64Src = isStringUrl
              ? null
              : valObj.base64 ||
                valObj.value?.base64 ||
                valObj.data?.value?.base64;

            // URL extractions (usually from Video or Image nodes)
            const urlSrc = isStringUrl
              ? val
              : valObj.url ||
                valObj.value?.url ||
                valObj.data?.value?.url ||
                null;

            // Extract MIME Type explicitly if provided (vital for video nodes like video/mp4)
            let nodeMimeType =
              valObj.mimeType ||
              valObj.value?.mimeType ||
              valObj.data?.value?.mimeType;

            // FIX: Prevent invalid partial mime types like "image" or "video" by normalizing them to valid structures expected by Gemini
            if (nodeMimeType === "image") nodeMimeType = "image/png";
            if (nodeMimeType === "video") nodeMimeType = "video/mp4";

            if (base64Src && !imageBase64) {
              // Strip "data:" bindings if they already exist
              if (
                typeof base64Src === "string" &&
                base64Src.startsWith("data:")
              ) {
                const [header, base64Data] = base64Src.split(",");
                imageBase64 = base64Data;
                mimeType =
                  nodeMimeType ||
                  header.split(":")[1].split(";")[0] ||
                  "image/png";
              } else {
                imageBase64 = base64Src;
                mimeType = nodeMimeType || "image/png";
              }
            } else if (urlSrc && typeof urlSrc === "string" && !imageBase64) {
              if (urlSrc.startsWith("data:")) {
                const [header, base64Data] = urlSrc.split(",");
                imageBase64 = base64Data;
                mimeType = nodeMimeType || header.split(":")[1].split(";")[0];
              } else if (
                urlSrc.startsWith("http") ||
                urlSrc.startsWith("blob:")
              ) {
                // 💡 FULL SUPPORT: Fetch Hosted URLs or Local Blob URLs from Video/Image Nodes
                try {
                  const fetchRes = await fetch(urlSrc);
                  const blob = await fetchRes.blob();
                  const base64data = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                  });
                  const [header, base64Data] = base64data.split(",");
                  imageBase64 = base64Data;

                  // Ensure videos retain 'video/mp4' so Gemini uses Video-enabled API correctly, fallback to blob type
                  mimeType = nodeMimeType || blob.type || "image/png";
                } catch (err) {
                  console.error(
                    "Failed fetching external media URL to transmit natively to Gemini:",
                    err,
                  );
                }
              }
            }
          }
        }

        // Ensure we combine image instructions with the text prompt correctly
        if (imageBase64 && prompt.trim()) {
          prompt =
            "Please analyze this media file according to the following instructions:\n\n" +
            prompt.trim();
        }

        if (!prompt.trim() && !imageBase64) {
          return "Error: No input provided. Connect text, image, or video nodes.";
        }

        // Default prompt if only media is provided without text node
        if (!prompt.trim() && imageBase64) {
          if (mimeType.startsWith("video")) {
            prompt = "Describe this video in detail.";
          } else {
            prompt = "Describe this image in detail.";
          }
        }

        try {
          const result = await runAI(prompt.trim(), imageBase64, mimeType);
          return result;
        } catch (error: any) {
          return `Error: ${error.message}`;
        }
      }

      case "imageNode":
      case "videoNode":
      case "cropNode":
      case "frameNode":
        return node.data?.value;

      default:
        return null;
    }
  };

  const runWorkflow = async () => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    const order = topoSort(nodes, edges);
    const results: any = {};

    // 🔥 CREATE RUN ENTRY
    const runRes = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const runData = await runRes.json();
    const runId = runData?.runId;

    for (const nodeId of order) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      const inputs = getInputs(nodeId, edges, results);

      // 🟡 RUNNING STATE
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  output: "Running...",
                  status: "running",
                },
              }
            : n,
        ),
      );

      let output: any;

      try {
        output = await executeNodeFn(node, inputs);

        // 🟢 SUCCESS STATE
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    output,
                    status: "success",
                  },
                }
              : n,
          ),
        );
      } catch (err: any) {
        output = "Error: " + err.message;

        // 🔴 ERROR STATE
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    output,
                    status: "error",
                  },
                }
              : n,
          ),
        );
      }

      results[nodeId] = output;
    }

    try {
      // Create a sanitized version of the results specifically for the run log
      const sanitizedResults: any = {};
      for (const [key, value] of Object.entries(results)) {
        if (typeof value === "object" && value !== null) {
          const cleanedValue: any = { ...value };
          if (cleanedValue.url?.length > 1000)
            cleanedValue.url =
              cleanedValue.url.substring(0, 50) + "...[truncated url]";
          if (cleanedValue.base64?.length > 1000)
            cleanedValue.base64 = "...[truncated base64]";
          sanitizedResults[key] = cleanedValue;
        } else {
          sanitizedResults[key] = value;
        }
      }

      // 🔥 UPDATE RUN OUTPUT
      await fetch("/api/run", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId,
          output: JSON.stringify(sanitizedResults),
        }),
      });
    } catch (e) {
      console.error("Failed to commit final outputs to logs: ", e);
    }
  };

  // Delete selected nodes and their connected edges
  const deleteNodes = useCallback(
    (nodeIds: string[]) => {
      const idsToDelete = new Set(nodeIds);
      setNodes((nds) => nds.filter((node) => !idsToDelete.has(node.id)));
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !idsToDelete.has(edge.source) && !idsToDelete.has(edge.target),
        ),
      );
      setSelectedNodes([]);
    },
    [setNodes, setEdges],
  );

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "Delete" || event.key === "Backspace") &&
        selectedNodes.length > 0
      ) {
        deleteNodes(selectedNodes);
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodes, deleteNodes]);

  // Handle node selection
  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes.map((node) => node.id));
  }, []);

  // Undo/Redo tracking state hooks locally integrated purely without disrupting parent logic flow engine execution variables
  const [history, setHistory] = useState<{ nodes: any[]; edges: any[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPushingToHistory, setIsPushingToHistory] = useState(true);

  // Debounced history record tracking mapped implicitly monitoring flow workspace changes gracefully capturing state
  useEffect(() => {
    if (!isPushingToHistory) {
      if (historyIndex >= 0) {
        const timer = setTimeout(() => setIsPushingToHistory(true), 150);
        return () => clearTimeout(timer);
      }
      return;
    }

    const timer = setTimeout(() => {
      setHistory((prev) => {
        const currentHistory = prev.slice(0, historyIndex + 1);
        if (currentHistory.length > 0) {
          const lastState = currentHistory[currentHistory.length - 1];
          if (
            JSON.stringify(lastState.nodes) === JSON.stringify(nodes) &&
            JSON.stringify(lastState.edges) === JSON.stringify(edges)
          ) {
            return prev;
          }
        }
        const newHistory = [
          ...currentHistory,
          {
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
          },
        ];
        if (newHistory.length > 50) newHistory.shift();

        setHistoryIndex(newHistory.length - 1);
        return newHistory;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [nodes, edges, historyIndex, isPushingToHistory]);

  const onUndo = useCallback(() => {
    if (historyIndex > 0) {
      setIsPushingToHistory(false);
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setNodes(JSON.parse(JSON.stringify(history[newIndex].nodes)));
      setEdges(JSON.parse(JSON.stringify(history[newIndex].edges)));
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const onRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setIsPushingToHistory(false);
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setNodes(JSON.parse(JSON.stringify(history[newIndex].nodes)));
      setEdges(JSON.parse(JSON.stringify(history[newIndex].edges)));
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Track executed nodes
  const [executedNodes, setExecutedNodes] = useState<Set<string>>(new Set());

  // ✅ INJECT HANDLERS
  const nodesWithHandlers = useMemo(
    () =>
      nodes.map((node) => {
        // 🔥 find incoming connection
        const incoming = edges.filter((e) => e.target === node.id);

        const inputNode = nodes.find((n) => n.id === incoming[0]?.source);

        return {
          ...node,
          data: {
            ...node.data,

            // 🔥 THIS LINE (your question)
            inputs: edges
              .filter((e) => e.target === node.id)
              .map((e) => {
                const source = nodes.find((n) => n.id === e.source);
                return source?.data?.value || source?.data;
              }),

            // handlers
            onChange: (val: any) => updateNodeData(node.id, val),
            onRun: () => runWorkflow(), // run entire workflow for simplicity
            onDelete: () => deleteNodes([node.id]),
            isSelected: selectedNodes.includes(node.id),
          },
        };
      }),
    [nodes, edges, selectedNodes, deleteNodes],
  );

  return (
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
      {/* SIDEBAR WRAPPER */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-12"
        } overflow-hidden bg-[#09090b] border-r border-[#27272a] shadow-xl z-20 shrink-0`}
      >
        <Sidebar
          onAddNode={addNode}
          onSave={saveFlow}
          onLoad={loadFlow}
          onHistory={() => setIsHistoryOpen(true)}
          onDeploy={() => alert("Deployment coming soon!")}
          onExport={exportFlow}
          onImport={() => document.getElementById("file-upload")?.click()}
          onUndo={onUndo}
          onRedo={onRedo}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      <div className="flex-1 relative h-full">
        {isHistoryOpen && (
          <RunHistoryPanel onClose={() => setIsHistoryOpen(false)} />
        )}

        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          deleteKeyCode={["Delete", "Backspace"]}
          fitView
          className="react-flow-krea"
        >
          <Background
            color="#3f3f46"
            gap={20}
            size={1.5}
            // variant={BackgroundVariant.Dots}
          />
          <Controls className="bg-zinc-900/90! backdrop-blur-sm border-zinc-800! shadow-2xl! rounded-xl! overflow-hidden [&>button]:bg-transparent! [&>button]:border-b-zinc-800! [&>button]:text-zinc-400! hover:[&>button]:bg-zinc-800! hover:[&>button]:text-zinc-100! transition-all" />
          <MiniMap
            className="bg-zinc-900/90! backdrop-blur-md border! border-zinc-800! rounded-xl! overflow-hidden shadow-2xl!"
            nodeColor={(n) => {
              if (n.type === "llmNode") return "#8b5cf6"; // Purple for AI
              if (n.type === "textNode") return "#3b82f6"; // Blue for Text
              if (n.type === "imageNode") return "#10b981"; // Green for Image
              if (n.type === "videoNode") return "#ef4444"; // Red for Video
              if (n.type === "frameNode") return "#f59e0b"; // Amber for Frame extraction
              if (n.type === "cropNode") return "#06b6d4"; // Cyan for Crop
              return "#52525b"; // Default Zinc
            }}
            maskColor="rgba(9, 9, 11, 0.8)"
            pannable
            zoomable
          />
        </ReactFlow>

        {/* TOP RIGHT CLERK PROFILE BUTTON */}
        <div className="absolute top-4 right-4 z-10 flex items-center bg-[#09090b]/80 p-2 rounded-lg backdrop-blur-sm shadow-md border border-[#27272a]">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-md",
              },
            }}
          />
        </div>

        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <button
            onClick={handleRunSelected}
            className="flex items-center gap-1 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium shadow"
          >
            <Play size={16} /> Run Selected
          </button>
          <button
            onClick={handleRunAll}
            className="flex items-center gap-1 px-3 py-1 mr-10 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium shadow"
          >
            <PlayCircle size={16} /> Run All
          </button>
        </div>
      </div>
    </div>
  );
}
