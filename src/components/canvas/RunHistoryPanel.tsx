"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface RunHistoryPanelProps {
  onClose?: () => void;
}

export default function RunHistoryPanel({ runs = [], onClose }: any) {
  const [runsState, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null); // Re-add missing select hook from UI updates natively

  const loadRuns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/run/list", {
        // Prevent caching completely to avoid stuck requests that fetch drops or handles incorrectly
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      console.log("RUN HISTORY DATA:", data); // 🔥 DEBUG

      setRuns(data || []);
    } catch (err) {
      console.error("Failed to load runs", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 initial load
  useEffect(() => {
    loadRuns();

    // Auto-refresh interval
    const interval = setInterval(() => {
      // Small safety check to not fire if the document is hidden/backgrounded to avoid socket congestion
      if (document.visibilityState === "visible") {
        loadRuns();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-4 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden flex flex-col z-50 max-h-[80vh]">
      {/* Header */}
      <div className="p-3 border-b border-gray-800 bg-gray-900 flex justify-between items-center z-10 sticky top-0">
        <h2 className="text-white font-medium text-sm flex items-center">
          <span className="mr-2">🕒</span> Run History
        </h2>

        <div className="flex items-center gap-2">
          {loading && (
            <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          <button
            onClick={() => loadRuns()}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
            title="Refresh history"
          >
            ↻
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors ml-1"
              title="Close history"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {loading && (
          <p className="text-xs text-gray-500 animate-pulse">
            Fetching execution logs...
          </p>
        )}

        {runs.length === 0 && !loading && (
          <div className="text-center p-6 border border-dashed border-[#27272a] rounded-lg mt-4">
            <p className="text-xs text-gray-500">
              No workflow history recorded yet.
            </p>
          </div>
        )}

        <div className="space-y-2 mt-4">
          {(Array.isArray(runs) ? runs : []).map((run) => (
            <div
              key={run.id}
              onClick={() => setSelected(run)}
              className={`cursor-pointer border border-[#27272a] hover:border-white-500/50 p-3 rounded-lg transition-all ${
                selected?.id === run.id
                  ? "bg-[#27272a] border-white-500/50"
                  : "bg-[#18181b]"
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 font-mono">
                  {run.id.substring(run.id.length - 6).toUpperCase()}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                    run.status === "success"
                      ? "bg-green-900/30 text-green-400 border border-green-900/50"
                      : run.status === "error"
                        ? "bg-red-900/30 text-red-400 border border-red-900/50"
                        : "bg-yellow-900/30 text-yellow-400 border border-yellow-900/50 animate-pulse"
                  }`}
                >
                  {run.status || "unknown"}
                </span>
              </div>

              <p className="text-xs text-gray-400">
                {run.createdAt
                  ? new Date(run.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "No time"}
              </p>
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-6 border-t border-[#27272a] pt-4">
            <h3 className="font-semibold mb-3 text-sm text-gray-300">
              Run Statistics & Output
            </h3>

            <div className="text-xs bg-[#121214] p-3 rounded-lg overflow-x-auto overflow-y-auto border border-[#27272a] max-h-80 scrollbar-thin text-gray-300 font-mono">
              <pre>
                {(() => {
                  try {
                    return JSON.stringify(
                      JSON.parse(selected.output || "{}"),
                      null,
                      2,
                    );
                  } catch {
                    return selected.output || "Invalid JSON";
                  }
                })()}
              </pre>
            </div>

            {/* Details View */}
            {selected && (
              <div className="mt-4">
                <h4 className="font-semibold text-xs text-gray-300 mb-2">
                  Details
                </h4>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-400 text-xs font-medium">
                      Run ID
                    </div>
                    <div className="text-gray-300 text-xs font-mono">
                      {selected.id}
                    </div>

                    <div className="text-gray-400 text-xs font-medium">
                      Status
                    </div>
                    <div className="text-gray-300 text-xs font-mono">
                      {selected.status}
                    </div>

                    <div className="text-gray-400 text-xs font-medium">
                      Created At
                    </div>
                    <div className="text-gray-300 text-xs font-mono">
                      {new Date(selected.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>

                    {selected.status === "error" && (
                      <>
                        <div className="text-gray-400 text-xs font-medium">
                          Error Message
                        </div>
                        <p className="text-xs text-red-500 font-mono p-2 bg-red-900/20 rounded border border-red-900 overflow-x-auto whitespace-pre-wrap">
                          {selected.error_message || "Unknown error occurred"}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
