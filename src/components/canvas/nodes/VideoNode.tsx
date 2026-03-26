// @ts-nocheck
"use client";

import { Handle, Position } from "reactflow";
import React, { useState, useEffect } from "react";
import { useTransloaditVideoUpload } from "@/hooks/useTransloaditVideoUpload";
import { useFlowStore } from "@/store/flowStore";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function VideoNode({ id, data }: any) {
  const setNodes = useFlowStore((state) => state.setNodes);
  const nodes = useFlowStore((state) => state.nodes);
  const [urlInput, setUrlInput] = useState("");
  const [fallbackMode, setFallbackMode] = useState(true); // Default to local mode
  const [fastMode, setFastMode] = useState(false); // Fast upload without processing
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use specialized video upload hook for better progress tracking
  const {
    uploadFile: uploadVideo,
    isUploading,
    uploadProgress,
    error: uploadError,
  } = useTransloaditVideoUpload();

  // Fast upload function that skips video processing
  const handleFastUpload = async (file: File) => {
    try {
      const signatureResponse = await fetch("/api/transloadit/fast-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!signatureResponse.ok) {
        throw new Error("Failed to get fast upload signature");
      }

      const { params, signature, endpoint } = await signatureResponse.json();
      const formData = new FormData();
      formData.append("params", JSON.stringify(params));
      formData.append("signature", signature);
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      return new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const originalFile =
              response.uploads?.[0] || response.results?.import?.[0];
            const thumbnail = response.results?.thumbnail?.[0];

            if (originalFile) {
              resolve({
                url: originalFile.url,
                ssl_url: originalFile.ssl_url || originalFile.url,
                name: originalFile.name || file.name,
                size: originalFile.size || file.size,
                type: originalFile.type || file.type,
                thumbnail_url: thumbnail?.url,
                meta: { fast_upload: true },
              });
            } else {
              reject(new Error("No file URL received"));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("POST", endpoint);
        xhr.send(formData);
      });
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      return;
    }

    // Auto-suggest fast mode for small files (under 50MB)
    if (!fallbackMode && file.size < 50 * 1024 * 1024 && !fastMode) {
      const shouldUseFastMode = confirm(
        `This video is ${Math.round(file.size / (1024 * 1024))}MB. Would you like to use Quick Upload (faster) instead of Full Processing?`,
      );
      if (shouldUseFastMode) {
        setFastMode(true);
      }
    }

    try {
      if (fallbackMode) {
        // Fallback: Local upload
        console.log("📁 Using fallback local upload for video");

        const url = URL.createObjectURL(file);

        const result = {
          url,
          type: "video",
          name: file.name,
          size: file.size,
          isLocal: true,
        };

        if (data?.onChange) {
          data.onChange(result);
        }
      } else if (fastMode) {
        // Fast Transloadit upload (no processing)
        console.log("⚡ Using fast Transloadit upload (no processing)");

        const uploadResult: any = await handleFastUpload(file);

        const result = {
          url: uploadResult.ssl_url || uploadResult.url,
          type: "video",
          name: uploadResult.name || file.name,
          size: uploadResult.size || file.size,
          isLocal: false,
          transloaditUrl: uploadResult.url,
          transloaditMeta: uploadResult.meta,
          thumbnailUrl: uploadResult.thumbnail_url,
        };

        if (data?.onChange) {
          data.onChange(result);
        }
      } else {
        // Full Transloadit upload with processing
        console.log(
          "☁️ Using full Transloadit upload with optimized processing",
        );

        const uploadResult = await uploadVideo(file);

        if (uploadResult && uploadResult.url) {
          const result = {
            url: uploadResult.url, // Directly link the returned finalized URL
            type: "video",
            name: uploadResult.originalName || file.name,
            size: uploadResult.size || file.size,
            isLocal: false,
            transloaditUrl: uploadResult.url,
            mimeType: uploadResult.mimeType || "video/mp4",
          };

          if (data?.onChange) {
            data.onChange(result);
          }
        }
      }
    } catch (uploadError: any) {
      console.error("❌ Video upload failed:", uploadError);

      // Automatic fallback to local upload
      console.log("🔄 Falling back to local video upload");

      const url = URL.createObjectURL(file);
      const result = {
        url,
        type: "video",
        name: file.name,
        size: file.size,
        isLocal: true,
        fallbackReason: uploadError.message,
      };

      if (data?.onChange) {
        data.onChange(result);
      }
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    // Validate URL
    if (!urlInput.startsWith("http")) {
      alert("Please enter a valid URL starting with http:// or https://");
      return;
    }

    const result = {
      url: urlInput.trim(),
      type: "video",
      name: "Remote video",
      isLocal: false, // Remote URL
    };

    if (data?.onChange) {
      data.onChange(result);
    }
  };

  useEffect(() => {
    if (data.status === "running") {
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

  return (
    <div
      className={`bg-gray-900 p-4 rounded-lg shadow-lg w-64 transition-all overflow-hidden relative group 
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
          Video Node
        </div>
        <button
          onClick={data.onDelete}
          className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-900/20"
          title="Delete node"
        >
          ✕
        </button>
      </div>

      {/* Upload Mode Toggle */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-gray-300">Upload mode:</label>
          <button
            onClick={() => setFallbackMode(!fallbackMode)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              fallbackMode
                ? "bg-yellow-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            {fallbackMode ? "📁 Local" : "☁️ Transloadit"}
          </button>
        </div>

        {/* Fast Mode Toggle (only shown when Transloadit is selected) */}
        {!fallbackMode && (
          <div className="flex items-center gap-2 mb-1">
            <label className="text-xs text-gray-400">Processing:</label>
            <button
              onClick={() => setFastMode(!fastMode)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                fastMode
                  ? "bg-green-600 text-white"
                  : "bg-orange-600 text-white"
              }`}
            >
              {fastMode ? "⚡ Quick Upload" : "🎬 Full Processing"}
            </button>
          </div>
        )}

        {/* Mode explanation */}
        <div className="text-xs text-gray-500 mt-1">
          {fallbackMode
            ? "📁 Local: Instant upload, browser-based processing"
            : fastMode
              ? "⚡ Quick: Upload only, minimal processing (fastest)"
              : "🎬 Full: Upload + encoding + optimization (slower but best quality)"}
        </div>
      </div>

      {/* Enhanced Upload Progress */}
      {isUploading && (
        <div className="mb-3 space-y-2">
          {/* Stage indicator */}
          <div className="text-xs text-blue-300 mb-1">
            {uploadProgress < 100
              ? "📤 Uploading video to Transloadit..."
              : "⚙️ Processing video (encoding, compression)..."}
          </div>

          {/* Upload Progress */}
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`bg-blue-500 h-2 rounded-full transition-all ${uploadProgress === 100 ? "animate-pulse bg-yellow-500" : ""}`}
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400">
            Progress: {Math.round(uploadProgress)}%
          </div>

          {/* Processing message when upload completes */}
          {uploadProgress === 100 && (
            <div className="text-xs text-gray-500 mt-1">
              💡 Transloadit is assembling your file according to the template.
              Processing usually takes 15-30 seconds depending on file size.
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-2 bg-red-900/30 border border-red-500 rounded text-xs text-red-300">
          Upload failed: {error}
        </div>
      )}

      {/* File Upload */}
      <div className="mb-3">
        <div className="text-xs text-gray-300 mb-2">
          Upload local video{" "}
          {fallbackMode ? "(Local mode)" : "(Transloadit processing)"}:
        </div>
        <label className="block w-full">
          <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <div
            className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
              isUploading
                ? "border-blue-500 bg-blue-900/20"
                : data.value?.url && data.value?.isLocal
                  ? "border-green-500 bg-green-900/20"
                  : "border-gray-600 hover:border-green-500"
            }`}
          >
            <div className="text-gray-400 text-sm">
              {isUploading
                ? "⏳ Processing video..."
                : data.value?.url && data.value?.isLocal
                  ? "✅ Local video uploaded"
                  : "📁 Upload local video"}
            </div>
          </div>
        </label>
        <div className="text-xs text-gray-400 mt-1">
          {fallbackMode
            ? "Local upload only"
            : fastMode
              ? "Quick upload with basic thumbnail only"
              : "Cloud processing with optimized encoding (360p, ultrafast)"}
        </div>
      </div>

      {/* URL Input */}
      <div className="mb-3">
        <div className="text-xs text-gray-300 mb-2">Or use public URL:</div>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="nodrag flex-1 border border-gray-600 rounded px-2 py-1 text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 text-xs"
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              urlInput.trim()
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Add
          </button>
        </div>
        {!data.value?.isLocal && (
          <div className="text-xs text-green-400 mt-1">
            💡 Use public URLs for frame extraction
          </div>
        )}
      </div>

      {/* Video Preview */}
      {data.value?.url && (
        <div className="mb-3 w-full bg-black rounded-md overflow-hidden border border-gray-600">
          {/* Add key to force re-render when video changes reliably and explicitly bypass crossOrigin issues */}
          <video
            key={data.value.url}
            src={data.value.url}
            className="w-full h-32 object-contain"
            controls
            crossOrigin="anonymous"
            preload="metadata"
          />
          <div className="text-xs text-gray-300 mt-1 space-y-1 p-2 bg-gray-900 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <span className="truncate max-w-37.5">
                {data.value.name ? `📹 ${data.value.name}` : "📹 Video"}
              </span>
              <span
                className={`px-1 rounded text-xs ${
                  data.value.isLocal
                    ? "bg-yellow-800 text-yellow-200"
                    : "bg-blue-800 text-blue-200"
                }`}
              >
                {data.value.isLocal ? "Local" : "Cloud"}
              </span>
            </div>

            {/* Transloadit processing info */}
            {data.value.transloaditMeta && (
              <div className="text-blue-400 text-xs">
                ☁️ Processed with Transloadit
                {data.value.transloaditMeta.processing && " (still processing)"}
              </div>
            )}

            {/* Fallback reason */}
            {data.value.fallbackReason && (
              <div className="text-yellow-400 text-xs">
                ⚠️ Fallback: {data.value.fallbackReason}
              </div>
            )}

            {/* Processing hint */}
            {data.value.isLocal ? (
              <div className="text-blue-300 text-xs p-2 bg-blue-900/20 rounded border border-blue-500/30">
                💡 Local videos use browser frame extraction. For cloud
                processing, use Transloadit mode.
              </div>
            ) : (
              <div className="text-green-300 text-xs p-2 bg-green-900/20 rounded border border-green-500/30">
                ✅ Cloud video ready for processing and frame extraction.
              </div>
            )}
          </div>
        </div>
      )}

      {!data.value?.url && (
        <div className="border-2 border-dashed border-gray-600 rounded-md p-4 text-center text-xs text-gray-400 mb-3">
          No video loaded
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="bg-green-500 border-2 border-gray-900"
      />
    </div>
  );
}
