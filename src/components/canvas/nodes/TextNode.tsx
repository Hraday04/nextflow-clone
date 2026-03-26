"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position } from "reactflow";
import {
  Copy,
  Sparkles,
  CheckCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useFlowStore } from "@/store/flowStore";

interface TextNodeData {
  id?: string;
  text?: string;
  value?: string;
  status?: "idle" | "running" | "success" | "error";
  isSelected?: boolean;
  onRun?: () => void;
  onChange?: (val: string) => void;
}

export default function TextNode({
  id,
  data,
  isConnectable,
}: {
  id: string;
  data: TextNodeData;
  isConnectable: boolean;
}) {
  const safeData = data || {};
  const setNodes = useFlowStore((state) => state.setNodes);
  const executeNode = useFlowStore((state: any) => state.executeNode);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse external variables mapped internally to generic structure properly
  const textValue = data.text || data.value || "";

  const handleRunNode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (executeNode) {
        executeNode(id);
      } else if (safeData.onRun) {
        safeData.onRun();
      }
    },
    [id, executeNode, safeData],
  );

  // Handle dynamic resizing explicitly ensuring the ref bounds sync structurally clean natively
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        Math.max(textareaRef.current.scrollHeight, 60),
        250,
      )}px`;
    }
  }, [textValue]);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (textValue) {
        navigator.clipboard.writeText(textValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    },
    [textValue],
  );

  useEffect(() => {
    if (data.status === "running" && !isRunning) {
      setIsRunning(true);
      // Simulate text node processing (replace with real logic if needed)
      setTimeout(() => {
        setIsRunning(false);
        setError(null);
        setNodes((nodes: any[]) =>
          nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, status: "success" } }
              : node,
          ),
        );
      }, 500);
    }
  }, [data.status, isRunning, id, setNodes]);

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
          ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)] border-2"
          : "border-[#27272a] hover:border-gray-600 border";
    }
  };

  return (
    <div
      className={`bg-[#18181b] rounded-lg w-64 transition-all overflow-hidden ${getStatusStyling(safeData.status)}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-gray-800"
        isConnectable={isConnectable}
      />

      {/* Header */}
      <div className="bg-[#18181b] p-3 flex items-center justify-between border-b border-[#27272a]">
        <div className="flex items-center gap-2 text-blue-400">
          <FileText size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Text
          </span>
        </div>

        {/* Action Panel purely resolving nested UI structurally */}
        <div className="flex items-center gap-2">
          {textValue && (
            <button
              onClick={handleCopy}
              className="bg-[#27272a] text-blue-400 hover:bg-blue-600 hover:text-white p-1 rounded transition-colors"
              title="Copy text"
            >
              {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
            </button>
          )}

          {/* Status Badges */}
          <div className="flex items-center">
            {safeData.status === "running" && (
              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-medium border border-yellow-500/20">
                <Loader2 size={10} className="animate-spin" />
                RUNNING
              </div>
            )}
            {safeData.status === "success" && (
              <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-medium border border-green-500/20">
                <CheckCircle2 size={10} />
                SUCCESS
              </div>
            )}
            {safeData.status === "error" && (
              <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-medium border border-red-500/20">
                <AlertCircle size={10} />
                FAILED
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content strictly tracking inputs cleanly natively matching */}
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={textValue}
          onChange={(e) => {
            const val = e.target.value;

            if (data?.onChange) {
              data.onChange(val);
            }

            setNodes((nodes) =>
              nodes.map((node) => {
                if (node.id === id) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      text: val,
                      value: val,
                    },
                  };
                }
                return node;
              }),
            );
          }}
          className="nodrag w-full bg-black/40 text-gray-300 text-sm p-3 rounded-md border border-gray-700/50 focus:border-blue-500/50 focus:outline-none resize-none"
          placeholder="Enter prompt or text here..."
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-gray-800"
        isConnectable={isConnectable}
      />
    </div>
  );
}
