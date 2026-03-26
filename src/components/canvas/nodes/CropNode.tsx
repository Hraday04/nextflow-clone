"use client";

import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { Loader2, Crop as CropIcon, CheckCircle2 } from "lucide-react";
import { useFlowStore } from "@/store/flowStore";

export default function CropNode({ id, data }: any) {
  const [cropParams, setCropParams] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);

  const setNodes = useFlowStore((state) => state.setNodes);
  const nodes = useFlowStore((state) => state.nodes);

  useEffect(() => {
    if (data.status === "running") {
      // Show running state in UI
      setNodes((nodes: any[]) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, isRunning: true } }
            : node,
        ),
      );
      setTimeout(() => {
        setNodes((nodes: any[]) =>
          nodes.map((node) =>
            node.id === id
              ? {
                  ...node,
                  data: { ...node.data, status: "success", isRunning: false },
                }
              : node,
          ),
        );
      }, 1000);
    }
  }, [data.status, id, setNodes]);

  // Find the first valid image input (url or base64)
  const findInputImage = () => {
    if (!data.inputs) return null;
    for (const i of data.inputs) {
      if (!i) continue;
      if (i.url) return { url: i.url, mimeType: i.mimeType };
      if (i.base64)
        return {
          url: `data:${i.mimeType || "image/png"};base64,${i.base64}`,
          mimeType: i.mimeType,
        };
      if (i.value?.url) return { url: i.value.url, mimeType: i.value.mimeType };
      if (i.value?.base64)
        return {
          url: `data:${i.value.mimeType || "image/png"};base64,${i.value.base64}`,
          mimeType: i.value.mimeType,
        };
      if (i.data?.value?.url)
        return { url: i.data.value.url, mimeType: i.data.value.mimeType };
      if (i.data?.value?.base64)
        return {
          url: `data:${i.data.value.mimeType || "image/png"};base64,${i.data.value.base64}`,
          mimeType: i.data.value.mimeType,
        };
      if (i.output?.url)
        return { url: i.output.url, mimeType: i.output.mimeType };
      if (i.output?.base64)
        return {
          url: `data:${i.output.mimeType || "image/png"};base64,${i.output.base64}`,
          mimeType: i.output.mimeType,
        };
    }
    return null;
  };

  const inputImage = findInputImage();

  const cropImage = async () => {
    if (!inputImage?.url) {
      setError("No valid image input found. Connect an Image Node first.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setCroppedUrl(null);
    try {
      const response = await fetch("/api/crop-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: inputImage.url,
          x: cropParams.x,
          y: cropParams.y,
          width: cropParams.width,
          height: cropParams.height,
        }),
      });
      if (!response.ok) throw new Error(`Crop failed: ${response.statusText}`);
      const result = await response.json();
      if (result.success && result.croppedImage) {
        setCroppedUrl(result.croppedImage);
        if (data?.onChange) {
          data.onChange({
            url: result.croppedImage,
            base64: result.base64,
            mimeType: result.mimeType,
            type: "image",
            cropParams: result.cropParams,
            status: "success",
          });
        }
      } else {
        throw new Error(result.error || "Crop operation failed");
      }
    } catch (err: any) {
      setError(err.message || "Crop failed");
      if (data?.onChange) {
        data.onChange({ status: "error" });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`bg-gray-900 p-4 rounded-lg shadow-lg w-56 transition-all overflow-hidden relative group 
        ${
          data.isRunning
            ? "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse border-2"
            : data.status === "success"
              ? "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)] border-2"
              : data.status === "error"
                ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] border-2"
                : data.isSelected
                  ? "border-green-500 border-2"
                  : "border-gray-700 hover:border-gray-600 border"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-white flex items-center gap-1">
          {data.isRunning ? (
            <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded text-[10px] font-medium border border-yellow-500/20">
              <Loader2 size={12} className="animate-spin" /> RUNNING
            </span>
          ) : data.status === "success" ? (
            <span className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-medium border border-green-500/20">
              <CheckCircle2 size={12} /> SUCCESS
            </span>
          ) : null}
          Crop Node
        </div>
        <button
          onClick={data.onDelete}
          className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-900/20"
          title="Delete node"
        >
          ✕
        </button>
      </div>

      {/* Input Image Preview */}
      {inputImage?.url ? (
        <div className="mb-3">
          <img
            src={inputImage.url}
            alt="Input image"
            className="w-full h-24 object-cover rounded-md border border-gray-600"
          />
          <div className="text-xs text-gray-300 mt-1">Input image ready</div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-md p-4 text-center text-xs text-gray-400 mb-3">
          Connect an Image Node to crop
        </div>
      )}

      {/* Crop Parameters */}
      <div className="mb-3 space-y-2">
        <div className="text-xs text-gray-300">Crop Settings:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <input
            type="number"
            placeholder="X"
            value={cropParams.x}
            onChange={(e) =>
              setCropParams({ ...cropParams, x: parseInt(e.target.value) || 0 })
            }
            className="nodrag border border-gray-600 rounded px-2 py-1 text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <input
            type="number"
            placeholder="Y"
            value={cropParams.y}
            onChange={(e) =>
              setCropParams({ ...cropParams, y: parseInt(e.target.value) || 0 })
            }
            className="nodrag border border-gray-600 rounded px-2 py-1 text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <input
            type="number"
            placeholder="Width"
            value={cropParams.width}
            onChange={(e) =>
              setCropParams({
                ...cropParams,
                width: parseInt(e.target.value) || 100,
              })
            }
            className="nodrag border border-gray-600 rounded px-2 py-1 text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <input
            type="number"
            placeholder="Height"
            value={cropParams.height}
            onChange={(e) =>
              setCropParams({
                ...cropParams,
                height: parseInt(e.target.value) || 100,
              })
            }
            className="nodrag border border-gray-600 rounded px-2 py-1 text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
      </div>

      {/* Crop Button */}
      <button
        onClick={cropImage}
        disabled={!inputImage?.url || isProcessing}
        className={`w-full py-2 rounded text-sm font-medium transition-colors ${
          inputImage?.url && !isProcessing
            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
            : "bg-gray-600 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center gap-1 justify-center">
            <Loader2 size={14} className="animate-spin" /> Processing...
          </span>
        ) : inputImage?.url ? (
          "✂️ Apply Crop"
        ) : (
          "No Image Input"
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-2 bg-red-900/30 border border-red-500 rounded text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Output Preview */}
      {croppedUrl && (
        <div className="mt-3">
          <div className="text-xs text-gray-300 mb-1">Cropped Output:</div>
          <img
            src={croppedUrl}
            alt="Cropped output"
            className="w-full h-20 object-cover rounded-md border border-yellow-500"
          />
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        className="bg-yellow-500 border-2 border-gray-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="bg-yellow-500 border-2 border-gray-900"
      />
    </div>
  );
}
