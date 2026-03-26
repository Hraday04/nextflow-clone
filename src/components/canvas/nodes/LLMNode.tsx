"use client";

import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Bot,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Play,
} from "lucide-react";
import { useFlowStore } from "@/store/flowStore";

const GEMINI_MODELS = [
  { label: "Gemini Pro", value: "gemini-pro" },
  { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
  { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
  { label: "Gemini 2.5 Pro", value: "gemini-2.5-pro" },
  { label: "Gemini 2.5 Flash", value: "gemini-2.5-flash" },
  { label: "Gemini Pro Vision", value: "gemini-pro-vision" },
];

interface LLMNodeData {
  prompt?: string;
  output?: string;
  inputs?: any[];
  hasConnectedInputs?: boolean;
  value?: any;
  status?: "idle" | "running" | "success" | "error";
  isSelected?: boolean;
  onDelete?: () => void;
  onRun?: () => void;
}

export default function LLMNode({
  id,
  data,
  isConnectable,
}: {
  id: string;
  data: LLMNodeData;
  isConnectable: boolean;
}) {
  const safeData = data || {};
  const isLoading = safeData.output === "Running...";
  const hasError = safeData.output?.startsWith("Error:");
  const hasOutput =
    safeData.output && safeData.output !== "Running..." && !hasError;

  // Filter out empty/null inputs
  const validInputs =
    safeData.inputs && Array.isArray(safeData.inputs)
      ? safeData.inputs.filter(
          (input) => input !== null && input !== undefined && input !== "",
        )
      : [];

  const hasInputs =
    validInputs.length > 0 || safeData.hasConnectedInputs || false;

  const setNodes = useFlowStore((state) => state.setNodes);

  const onChange = React.useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, prompt: evt.target.value },
            };
          }
          return node;
        }),
      );
    },
    [id, setNodes],
  );

  const getStatusStyling = (status?: string) => {
    switch (status) {
      case "running":
        return "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse border-2";
      case "success":
        return "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)] border-2";
      case "error":
        return "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] border-2";
      default:
        return safeData.isSelected
          ? "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)] border-2"
          : "border-[#27272a] hover:border-gray-600 border";
    }
  };

  const textInputs = validInputs.filter(
    (i) => typeof i === "string" && !i.startsWith("data:image"),
  );
  const mappedImageInputs = validInputs.filter(
    (i) =>
      (typeof i === "object" && i !== null && i.base64) ||
      (typeof i === "string" && i.startsWith("data:image")),
  );

  // Find first text, image, or video input
  const findInput = () => {
    if (!data.inputs) return null;

    for (const i of data.inputs) {
      if (!i) continue;

      // ✅ CASE: plain string (MOST IMPORTANT FIX)
      if (typeof i === "string") {
        return { inputType: "text", text: i };
      }

      // Existing cases
      if (i.type === "text" && i.text) {
        return { inputType: "text", text: i.text };
      }

      if (i.type === "image" && (i.url || i.base64)) {
        return { ...i, inputType: "image" };
      }

      if (i.type === "video" && i.url) {
        return { ...i, inputType: "video" };
      }

      if (i.value?.type === "text" && i.value.text) {
        return { inputType: "text", text: i.value.text };
      }

      if (i.value?.type === "image" && (i.value.url || i.value.base64)) {
        return { ...i.value, inputType: "image" };
      }

      if (i.value?.type === "video" && i.value.url) {
        return { ...i.value, inputType: "video" };
      }
    }

    return null;
  };

  const input = findInput();

  const handleAnalyze = async () => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    try {
      const payload: any = {
        model: selectedModel,
      };
      if (input) {
        if (input.inputType === "text") {
          payload.text = input.text;
        } else if (input.inputType === "image") {
          payload.image =
            input.url ||
            `data:${input.mimeType || "image/png"};base64,${input.base64}`;
        } else if (input.inputType === "video") {
          payload.video = input.url;
        }
      }
      const response = await fetch("/api/llm/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`LLM failed: ${response.statusText}`);
      const res = await response.json();
      if (res.success && res.result) {
        setResult(res.result);
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: { ...node.data, output: res.result, status: "success" },
                }
              : node,
          ),
        );
      } else {
        throw new Error(res.error || "LLM operation failed");
      }
    } catch (err: any) {
      setError(err.message || "LLM failed");
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: { ...node.data, output: err.message, status: "error" },
              }
            : node,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const [prompt, setPrompt] = useState(safeData.prompt || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0].value);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (data.status === "running" && !isProcessing && !hasRun) {
      setHasRun(true);
      handleAnalyze().finally(() => {
        setTimeout(() => setHasRun(false), 500); // allow re-run
      });
    }
  }, [data.status, handleAnalyze, hasRun, isProcessing]);

  return (
    <div
      className={`bg-gray-900 p-4 rounded-lg shadow-lg border-2 w-80 ${
        data.isSelected
          ? "border-cyan-500 shadow-cyan-900"
          : "border-gray-700 hover:border-gray-600"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-white flex items-center gap-1">
          <Bot size={16} /> LLM Node
        </div>
        <button
          onClick={data.onDelete}
          className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-900/20"
          title="Delete node"
        >
          ✕
        </button>
      </div>
      {/* Model Selector */}
      <div className="mb-3">
        <label className="text-xs text-gray-400">Gemini Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full mt-1 px-2 py-1 rounded bg-gray-800 text-white text-xs border border-gray-600 focus:outline-none"
        >
          {GEMINI_MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      {/* Input Preview */}
      {input ? (
        <div className="mb-3">
          {input.inputType === "image" ? (
            <div className="flex flex-col items-center">
              <ImageIcon size={18} className="text-cyan-400 mb-1" />
              <img
                src={
                  input.url ||
                  `data:${input.mimeType || "image/png"};base64,${input.base64}`
                }
                alt="Input"
                className="w-full h-24 object-contain rounded border border-gray-600"
              />
              <div className="text-xs text-gray-300 mt-1">Image input</div>
            </div>
          ) : input.inputType === "video" ? (
            <div className="flex flex-col items-center">
              <VideoIcon size={18} className="text-cyan-400 mb-1" />
              <video
                src={input.url}
                controls
                className="w-full h-24 object-contain rounded border border-gray-600"
                preload="metadata"
              />
              <div className="text-xs text-gray-300 mt-1">Video input</div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FileText size={18} className="text-cyan-400 mb-1" />
              <div className="w-full bg-gray-800 rounded p-2 text-xs text-gray-200 border border-gray-600 max-h-20 overflow-y-auto">
                {input.text?.slice(0, 200) || "No text"}
                {input.text && input.text.length > 200 && (
                  <span className="text-gray-500">... (truncated)</span>
                )}
              </div>
              <div className="text-xs text-gray-300 mt-1">Text input</div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-md p-4 text-center text-xs text-gray-400 mb-3">
          Connect a Text, Image, or Video Node
        </div>
      )}
      {/* Run Gemini Button */}
      <div className="mb-3 flex flex-col items-stretch">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isProcessing || !input}
          className={`w-full py-2 rounded flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            !isProcessing && input
              ? "bg-cyan-600 hover:bg-cyan-700 text-white"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Running Gemini
            </>
          ) : (
            <>
              <Play size={16} /> Run Gemini
            </>
          )}
        </button>
      </div>
      {/* Error Display */}
      {error && (
        <div className="mt-2 p-2 bg-red-900/30 border border-red-500 rounded text-xs text-red-300">
          {error}
        </div>
      )}
      {/* Result Display */}
      {result && (
        <div className="mt-3 p-2 bg-cyan-900/20 border border-cyan-500/30 rounded text-xs text-cyan-200 whitespace-pre-wrap">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle2 size={12} /> Gemini Output:
          </div>
          {result}
        </div>
      )}
      <Handle
        type="target"
        position={Position.Left}
        className="bg-cyan-500 border-2 border-gray-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="bg-cyan-500 border-2 border-gray-900"
      />
    </div>
  );
}
