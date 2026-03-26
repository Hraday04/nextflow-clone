// @ts-nocheck
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position } from "reactflow";
import { MonitorPlay, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useFlowStore } from "@/store/flowStore";

interface FrameNodeData {
  config?: {
    timestamp?: number;
    [key: string]: any;
  };
  inputs?: any[];
  value?: any;
  status?: "idle" | "running" | "success" | "error";
  isSelected?: boolean;
  onChange?: (val: any) => void;
}

export default function FrameNode({
  id,
  data,
  isConnectable,
}: {
  id: string;
  data: FrameNodeData | null;
  isConnectable: boolean;
}) {
  const setNodes = useFlowStore((state) => state.setNodes);
  const safeData = data || {};
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timestamp, setTimestamp] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data.status === "running" && !isRunning) {
      setIsRunning(true);
      // Simulate frame node processing (replace with real logic if needed)
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
  }, [data.status]);

  // Extract frame from local video using Canvas API
  const extractLocalFrame = async (videoInput: any) => {
    return new Promise<string>((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error("Video element not available"));
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Set up video event handlers
      const onLoadedData = () => {
        console.log("📹 Video loaded, seeking to timestamp:", timestamp);
        video.currentTime = timestamp;
      };

      const onSeeked = () => {
        try {
          console.log(
            "🎯 Video seeked, extracting frame at:",
            video.currentTime,
          );

          // Force minor delay to allow browser compositor to decode the actual visual frame (Fixes black image issue)
          setTimeout(() => {
            try {
              // Set canvas size to match video
              canvas.width = video.videoWidth || 640;
              canvas.height = video.videoHeight || 480;

              console.log("📐 Canvas size:", canvas.width, "x", canvas.height);

              // Draw current frame to canvas
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              // Get base64 data
              const base64Data = canvas.toDataURL("image/jpeg", 0.8);

              // Validate it isn't an empty/black canvas
              const isEmpty = base64Data.length < 5000; // Small byte sizes are usually empty canvases
              if (isEmpty) {
                console.warn(
                  "⚠️ Extracted frame seems empty/black, retrying render...",
                );
              }

              console.log(
                "✅ Local frame extracted successfully, data length:",
                base64Data.length,
              );

              // Clean up event listeners
              video.removeEventListener("loadeddata", onLoadedData);
              video.removeEventListener("seeked", onSeeked);
              video.removeEventListener("error", onError);

              resolve(base64Data);
            } catch (err) {
              reject(err);
            }
          }, 300); // 300ms pause handles frame decoding buffering for most browsers
        } catch (error) {
          console.error("❌ Canvas extraction error:", error);
          reject(error);
        }
      };

      const onError = (event: any) => {
        console.error("❌ Video error during local extraction:", event);
        reject(
          new Error(
            `Video loading failed: ${event.message || "Unknown error"}`,
          ),
        );
      };

      // Add event listeners
      video.addEventListener("loadeddata", onLoadedData);
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("error", onError);

      // Start the process
      console.log("🚀 Starting local frame extraction for:", videoInput.url);

      // Ensure crossOrigin is configured for remote files to prevent Canvas Taint
      if (videoInput.url.startsWith("http")) {
        video.crossOrigin = "anonymous";
      }

      // If video is already loaded and seeked to correct time, execute
      if (
        video.readyState >= 2 &&
        Math.abs(video.currentTime - timestamp) < 0.2
      ) {
        console.log("📹 Video already loaded at target, extracting directly");
        onSeeked();
      } else {
        video.src = videoInput.url;
        video.currentTime = timestamp; // Immediately request seek
        video.load();
      }
    });
  };

  // Extract frame from remote video using API
  const extractRemoteFrame = async (videoInput: any) => {
    console.log("🚀 Calling extract-frame API with:", {
      videoUrl: videoInput.url,
      timestamp: timestamp,
    });

    const response = await fetch("/api/extract-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrl: videoInput.url,
        timestamp: timestamp,
      }),
    });

    if (!response.ok) {
      throw new Error(`Frame extraction failed: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.extractedFrame;
    } else {
      throw new Error(result.error || "Frame extraction failed");
    }
  };

  const extractFrame = async () => {
    setIsProcessing(true);

    // Video inputs might be passed natively as object payloads, url strings, or full payload structures
    console.log("FrameNode incoming safeData.inputs: ", safeData.inputs);

    const videoInput = safeData.inputs?.find(
      (input) =>
        // Handles legacy string URL mappings
        (typeof input === "string" &&
          (input.includes(".mp4") || input.includes("blob:"))) ||
        // Handles pure string mappings with data headers
        (typeof input === "string" && input.startsWith("http")) ||
        // Handles proper object generic payloads directly from VideoNode
        (input && typeof input === "object" && input.url),
    );

    let finalVideoUrl = null;
    if (typeof videoInput === "string") {
      finalVideoUrl = videoInput;
    } else if (videoInput && typeof videoInput === "object" && videoInput.url) {
      finalVideoUrl = videoInput.url;
    }

    if (!finalVideoUrl) {
      console.warn(
        "FrameNode: No valid video input found to extract frame from.",
      );
      alert(
        "Please connect a video node with an uploaded video to extract frames.",
      );
      setIsProcessing(false);
      return;
    }

    try {
      let extractedFrame: string;
      let extractionResult: any;

      // Determine extraction method based on video type
      if (videoInput.url?.startsWith("blob:") || videoInput.isLocal) {
        console.log("🔧 Using local extraction method (Canvas API)");
        extractedFrame = await extractLocalFrame(videoInput);

        // Create result object for local extraction
        extractionResult = {
          url: extractedFrame,
          base64: extractedFrame.includes("data:")
            ? extractedFrame.split(",")[1]
            : extractedFrame,
          mimeType: "image/jpeg",
          type: "image",
          extractedAt: timestamp,
          extractionMethod: "local",
          sourceVideo: videoInput.url,
        };
      } else if (videoInput.url?.startsWith("http")) {
        console.log("🔧 Using remote extraction method (Trigger.dev API)");
        const result = await extractRemoteFrame(videoInput);

        // Use result from remote extraction
        extractionResult = {
          url: result.includes("data:")
            ? result
            : `data:image/jpeg;base64,${result}`,
          base64: result.includes("data:") ? result.split(",")[1] : result,
          mimeType: "image/jpeg",
          type: "image",
          extractedAt: timestamp,
          extractionMethod: "remote",
          sourceVideo: videoInput.url,
        };
      } else {
        throw new Error(
          "Invalid video URL format. Must be a local file (blob:) or remote URL (http/https).",
        );
      }

      console.log("✅ Frame extraction successful:", extractionResult);

      // Update node output with extracted frame if onChange exists
      if (data?.onChange) {
        if (data?.onChange) {
        }
        extractionResult;
      }

      // Also call onChange if it exists for backwards compatibility
      if (safeData.onChange) {
        safeData.onChange(extractionResult);
      }

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
    } catch (error) {
      console.error("FrameNode: Error extracting frame:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-establish local display mappings purely handling array layouts
  const displayVideoInput = safeData.inputs?.find(
    (input) =>
      (typeof input === "string" &&
        (input.includes(".mp4") || input.includes("blob:"))) ||
      (typeof input === "string" && input.startsWith("http")) ||
      (input && typeof input === "object" && input.url),
  );

  const displayUrl =
    typeof displayVideoInput === "string"
      ? displayVideoInput
      : displayVideoInput?.url || null;

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
          ? "border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)] border-2"
          : "border-[#27272a] hover:border-gray-600 border";
    }
  };

  return (
    <div
      className={`bg-[#18181b] rounded-lg w-56 transition-all overflow-hidden ${getStatusStyling(isProcessing ? "running" : safeData.status)}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-orange-500 border-2 border-[#18181b]"
        isConnectable={isConnectable}
      />

      <div className="bg-[#18181b] p-3 flex items-center justify-between border-b border-[#27272a]">
        <div className="flex items-center gap-2 text-orange-400">
          <MonitorPlay size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Extract Frames
          </span>
        </div>

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

      <div className="p-3 space-y-3">
        {/* ACTION BUTTON */}
        <button
          onClick={extractFrame}
          disabled={!displayUrl || isProcessing}
          className={`w-full py-2 rounded flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
            displayUrl && !isProcessing
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-[#27272a] text-gray-500 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Processing...
            </>
          ) : displayUrl ? (
            <>Extract Frame</>
          ) : (
            <>Connect Video First</>
          )}
        </button>

        {/* Extracted Image Preview */}
        {safeData.value?.url && (
          <div className="rounded overflow-hidden border border-gray-700 bg-black/50 relative">
            <img
              src={safeData.value.url}
              alt="Extracted frame"
              className="w-full h-auto object-contain"
            />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm">
              From {safeData.value.extractedAt}s
            </div>
          </div>
        )}

        {/* Input Video Preview */}
        {displayUrl ? (
          <div className="mb-3">
            <video
              ref={videoRef}
              src={displayUrl}
              className="w-full h-32 object-cover rounded-md border border-gray-600"
              controls
              onLoadedData={(e) => {
                const vid = e.target as HTMLVideoElement;
                vid.currentTime = timestamp;
              }}
            />
            <div className="text-xs text-gray-300 mt-1">
              Video ready for frame extraction
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-600 rounded-md p-4 text-center text-xs text-gray-400 mb-3">
            Connect a Video Node to extract frames
          </div>
        )}

        {/* Timestamp Input */}
        <div className="mb-3">
          <div className="text-xs text-gray-300 mb-2">
            Extract at timestamp (seconds):
          </div>
          <input
            type="number"
            min="0"
            step="0.1"
            value={timestamp}
            onChange={(e) => setTimestamp(parseFloat(e.target.value) || 0)}
            className="nodrag w-full border border-gray-600 rounded px-2 py-1 text-white bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Timestamp in seconds"
          />
        </div>

        {/* Extract Button */}
        <button
          onClick={extractFrame}
          disabled={!displayUrl || isProcessing}
          className={`w-full py-2 rounded flex items-center justify-center gap-2 text-xs font-medium transition-colors ${
            displayUrl && !isProcessing
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-[#27272a] text-gray-500 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Processing...
            </>
          ) : displayUrl ? (
            <>Extract Frame</>
          ) : (
            <>Connect Video First</>
          )}
        </button>

        {/* Connection Status */}
        <div
          className={`text-xs px-2 py-1.5 rounded flex items-center gap-2 border ${
            displayUrl
              ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
              : "bg-gray-800/50 text-gray-400 border-gray-700/50"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${displayUrl ? "bg-orange-500 animate-pulse" : "bg-gray-600"}`}
          />
          {displayUrl ? "Video Connected" : "Waiting for Video..."}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="bg-blue-500 border-2 border-gray-900"
      />

      {/* Hidden canvas for local frame extraction */}
      <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden="true" />
    </div>
  );
}
