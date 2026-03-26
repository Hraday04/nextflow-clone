"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Handle, Position } from "reactflow";
import { useTransloaditUpload } from "@/hooks/useTransloaditUpload";
import {
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
} from "lucide-react";
import { useFlowStore } from "@/store/flowStore";

interface ImageNodeData {
  url?: string;
  base64?: string;
  mimeType?: string;
  name?: string;
  size?: number;
  isLocal?: boolean;
  isTransloadit?: boolean;
  status?: string;
  value?: any;
  onChange?: (val: any) => void;
  onRun?: () => void;
  isSelected?: boolean;
}

export default function ImageNode({
  id,
  data,
  isConnectable,
}: {
  id: string;
  data: ImageNodeData;
  isConnectable: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setNodes = useFlowStore((state) => state.setNodes);
  const safeData = { ...data, ...(data.value || {}) };

  const [fallbackMode, setFallbackMode] = useState(true); // Local by default
  const [isUploading, setIsUploading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  const {
    uploadFile: uploadCloudImage,
    isUploading: isCloudUploading,
    progress: uploadProgress,
    error: cloudError,
  } = useTransloaditUpload();

  // Always sync preview
  useEffect(() => {
    if (safeData.url) setLocalImageUrl(safeData.url);
    else if (safeData.base64)
      setLocalImageUrl(
        `data:${safeData.mimeType || "image/png"};base64,${safeData.base64}`,
      );
    else setLocalImageUrl(null);
  }, [safeData.url, safeData.base64, safeData.mimeType]);

  // Helper for local upload
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString() || "");
      reader.onerror = reject;
    });
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      let payload: any = { status: "success" };
      if (fallbackMode) {
        // Local upload
        const fullBase64 = await fileToBase64(file);
        payload = {
          url: fullBase64,
          base64: fullBase64.split(",")[1],
          mimeType: file.type,
          name: file.name,
          size: file.size,
          isLocal: true,
          isTransloadit: false,
          status: "success",
          value: {
            url: fullBase64,
            type: "image",
            mimeType: file.type,
            isLocal: true,
          },
        };
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ...payload,
                  status: "success",
                },
              };
            }
            return node;
          }),
        );
      } else {
        // Cloud upload
        const result = await uploadCloudImage(file, "image");
        payload = {
          url: result.url,
          mimeType: file.type,
          name: result.name || file.name,
          size: result.size || file.size,
          isLocal: false,
          isTransloadit: true,
          status: "success",
          value: {
            url: result.url,
            type: "image",
            mimeType: file.type,
            isTransloadit: true,
          },
        };
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  ...payload,
                  status: "success",
                },
              };
            }
            return node;
          }),
        );
      }
      setLocalImageUrl(payload.url);
      if (data?.onChange) data.onChange(payload.value);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                status: "error",
              },
            };
          }
          return node;
        }),
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Node execution simulation (for demo purposes)
  useEffect(() => {
    if (data.status === "running" && !isRunning) {
      setIsRunning(true);
      // Simulate image node processing (replace with real logic if needed)
      setTimeout(() => {
        setIsRunning(false);
        setError(null);
        setNodes((nodes) =>
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
      case "uploading":
        return "border-yellow-500 animate-pulse border-2";
      case "success":
        return "border-green-500 border-2";
      case "error":
        return "border-red-500 border-2";
      default:
        return safeData.isSelected
          ? "border-green-500 border-2"
          : "border-[#27272a] hover:border-gray-600 border";
    }
  };

  const handleRunNode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if ((useFlowStore as any).getState().executeNode) {
        (useFlowStore as any).getState().executeNode(id);
      } else if (safeData.onRun) {
        safeData.onRun();
      }
    },
    [id, safeData],
  );

  return (
    <div
      className={`bg-[#18181b] rounded-lg w-64 transition-all overflow-hidden relative group ${getStatusStyling(
        isUploading || isCloudUploading ? "running" : safeData.status,
      )}`}
    >
      {/* HEADER */}
      <div className="bg-[#18181b] p-3 flex items-center justify-between border-b border-[#27272a]">
        <div className="flex items-center gap-2 text-cyan-400">
          <ImageIcon size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Image
          </span>
        </div>
        <div className="flex items-center">
          {(safeData.status === "running" ||
            isUploading ||
            isCloudUploading) && (
            <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-medium border border-yellow-500/20">
              <Loader2 size={10} className="animate-spin" /> RUNNING
            </div>
          )}
          {safeData.status === "success" &&
            !isUploading &&
            !isCloudUploading && (
              <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-medium border border-green-500/20">
                <CheckCircle2 size={10} /> SUCCESS
              </div>
            )}
          {safeData.status === "error" && !isUploading && !isCloudUploading && (
            <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-medium border border-red-500/20">
              <AlertCircle size={10} /> FAILED
            </div>
          )}
        </div>
      </div>
      {/* CONTENT */}
      <div className="p-3">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs text-gray-400">Mode:</label>
          <button
            onClick={() => setFallbackMode(!fallbackMode)}
            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
              fallbackMode
                ? "bg-yellow-600/80 text-white"
                : "bg-blue-600/80 text-white"
            }`}
          >
            {fallbackMode ? "📁 Local Default" : "☁️ Transloadit Cloud"}
          </button>
        </div>
        {/* Upload Progress */}
        {(isUploading || isCloudUploading) && (
          <div className="mb-3">
            <div className="text-xs text-blue-300 mb-1">
              {fallbackMode ? "Processing Locally..." : "Uploading to Cloud..."}
            </div>
            {!fallbackMode && (
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        {/* Error Display */}
        {(error || cloudError) && (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-500 rounded text-xs text-red-300">
            {error || cloudError}
          </div>
        )}
        {/* File Upload */}
        <div className="mb-3">
          <input
            type="file"
            accept="image/*"
            className="nodrag text-sm text-white w-full file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-green-600 file:text-white hover:file:bg-green-500 file:cursor-pointer"
            onChange={handleUpload}
            disabled={isUploading || isCloudUploading}
            ref={fileInputRef}
          />
        </div>
        {/* Preview */}
        {localImageUrl && (
          <div className="mb-2">
            <div className="text-[10px] text-gray-400 mt-1 break-all mb-2">
              {safeData.isTransloadit
                ? "☁️ Cloud Optimized"
                : "📁 Local File Active"}
            </div>
            <img
              src={localImageUrl}
              alt="Preview"
              className="mt-2 text-white w-full h-auto max-h-48 object-contain rounded border border-gray-600"
            />
          </div>
        )}
        {!localImageUrl && (
          <div className="border-2 border-dashed border-gray-600 rounded-md p-4 text-center text-xs text-gray-400 mb-2">
            No image selected
          </div>
        )}
        {/* ACTION BUTTON */}
        <button
          onClick={handleRunNode}
          className={`mt-3 w-full py-2 rounded flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
            safeData.status === "running" || isUploading || isCloudUploading
              ? "bg-[#27272a] text-cyan-500"
              : "bg-cyan-600 hover:bg-cyan-700 text-white"
          }`}
        >
          {safeData.status === "running" || isUploading || isCloudUploading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Running...
            </>
          ) : (
            <>
              <Play size={14} className="fill-current" /> Run Node
            </>
          )}
        </button>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="bg-green-500 border-2 border-gray-900"
      />
    </div>
  );
}
