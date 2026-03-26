import React from "react";
import {
  Copy,
  Image as ImageIcon,
  Box,
  Video,
  MonitorPlay,
  Crop,
  Save,
  FolderOpen,
  History,
  Rocket,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  Undo,
  Redo,
} from "lucide-react";

interface SidebarProps {
  onAddNode: (type: string) => void;
  onSave?: () => void;
  onLoad?: () => void;
  onHistory?: () => void;
  onDeploy?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  onAddNode,
  onSave,
  onLoad,
  onHistory,
  onDeploy,
  onExport,
  onImport,
  onUndo,
  onRedo,
  isOpen,
  onToggle,
}: SidebarProps) {
  if (!isOpen) {
    return (
      <div className="w-12 bg-[#09090b] border-r border-[#27272a] h-full flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 bg-[#18181b] rounded hover:bg-[#27272a] border border-[#27272a] text-gray-400 hover:text-white transition-colors mb-4"
          title="Expand Sidebar"
        >
          <ChevronRight size={16} />
        </button>

        <div className="space-y-4 flex-1 flex flex-col items-center overflow-y-auto pt-2 no-scrollbar w-full">
          <button
            onClick={() => onAddNode("textNode")}
            className="p-2 text-gray-400 hover:text-white group"
            title="Text Node"
          >
            <Copy size={20} />
          </button>
          <button
            onClick={() => onAddNode("imageNode")}
            className="p-2 text-gray-400 hover:text-white group"
            title="Image Node"
          >
            <ImageIcon size={20} />
          </button>
          <button
            onClick={() => onAddNode("llmNode")}
            className="p-2 text-gray-400 hover:text-white group"
            title="LLM Node"
          >
            <Box size={20} />
          </button>
          <button
            onClick={() => onAddNode("videoNode")}
            className="p-2 text-gray-400 hover:text-white group"
            title="Video Node"
          >
            <Video size={20} />
          </button>

          <div className="w-8 h-px bg-[#27272a] my-2" />

          <button
            onClick={() => onAddNode("frameNode")}
            className="p-2 text-gray-400 hover:text-white group"
            title="Extract Frames"
          >
            <MonitorPlay size={20} />
          </button>
          <button
            onClick={() => onAddNode("cropNode")}
            className="p-2 text-gray-400 hover:text-white group"
            title="Smart Crop"
          >
            <Crop size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#09090b] border-r border-[#27272a] h-full flex flex-col">
      <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Node Library
        </h2>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-[#27272a] rounded text-gray-400 hover:text-white transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {/* TEXT NODE */}
        <button
          onClick={() => onAddNode("textNode")}
          className="w-full h-12 flex items-center justify-center gap-2 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-sm font-medium text-white group"
        >
          <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />
          <span>Text Node</span>
        </button>

        {/* IMAGE NODE */}
        <button
          onClick={() => onAddNode("imageNode")}
          className="w-full h-12 flex items-center justify-center gap-2 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-sm font-medium text-white group"
        >
          <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
          <span>Image Node</span>
        </button>

        {/* LLM NODE */}
        <button
          onClick={() => onAddNode("llmNode")}
          className="w-full h-12 flex items-center justify-center gap-2 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-sm font-medium text-white group"
        >
          <Box className="w-4 h-4 text-gray-400 group-hover:text-white" />
          <span>LLM Node</span>
        </button>

        {/* VIDEO NODE */}
        <button
          onClick={() => onAddNode("videoNode")}
          className="w-full h-12 flex items-center justify-center gap-2 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-sm font-medium text-white group"
        >
          <Video className="w-4 h-4 text-gray-400 group-hover:text-white" />
          <span>Video Reference Node</span>
        </button>

        {/* COMING SOON NODES */}
        <div className="pt-4 mt-4 border-t border-[#27272a]">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Processing Nodes
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => onAddNode("frameNode")}
              className="w-full h-12 flex items-center justify-center gap-2 border border-[#27272a] bg-[#18181b]/50 rounded-lg shadow-sm hover:bg-[#27272a] transition-all text-sm font-medium text-gray-300 group"
            >
              <MonitorPlay className="w-4 h-4 text-gray-400 group-hover:text-white" />
              <span>Extract Frames</span>
            </button>
            <button
              onClick={() => onAddNode("cropNode")}
              className="w-full h-12 flex items-center justify-center gap-2 border border-[#27272a] bg-[#18181b]/50 rounded-lg shadow-sm hover:bg-[#27272a] transition-all text-sm font-medium text-gray-300 group"
            >
              <Crop className="w-4 h-4 text-gray-400 group-hover:text-white" />
              <span>Smart Crop</span>
            </button>
          </div>
        </div>

        {/* WORKFLOW ACTIONS */}
        <div className="pt-4 mt-4 border-t border-[#27272a]">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onUndo}
              className="h-14 flex flex-col items-center justify-center gap-1 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-xs font-medium text-gray-300 hover:text-white"
            >
              <Undo className="w-4 h-4" />
              <span>Undo</span>
            </button>
            <button
              onClick={onRedo}
              className="h-14 flex flex-col items-center justify-center gap-1 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-xs font-medium text-gray-300 hover:text-white"
            >
              <Redo className="w-4 h-4" />
              <span>Redo</span>
            </button>
            <button
              onClick={onSave}
              className="h-14 flex flex-col items-center justify-center gap-1 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-xs font-medium text-gray-300 hover:text-white"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={onLoad}
              className="h-14 flex flex-col items-center justify-center gap-1 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-xs font-medium text-gray-300 hover:text-white"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Load</span>
            </button>
            <button
              onClick={onImport}
              className="h-14 flex flex-col items-center justify-center gap-1 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-xs font-medium text-gray-300 hover:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button
              onClick={onExport}
              className="h-14 flex flex-col items-center justify-center gap-1 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-xs font-medium text-gray-300 hover:text-white"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onHistory}
              className="h-14 flex flex-col items-center justify-center gap-1 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-xs font-medium text-gray-300 hover:text-white"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
            <button
              onClick={onDeploy}
              className="h-14 flex flex-col items-center justify-center gap-1 border border-[#27272a] bg-[#18181b] rounded-lg shadow-sm hover:border-gray-500 hover:bg-[#27272a] transition-all text-xs font-medium text-gray-300 hover:text-white"
            >
              <Rocket className="w-4 h-4" />
              <span>Deploy</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-[#27272a]">
        <div className="text-xs text-gray-500 text-center">
          NextFlow Engine v1.0
        </div>
      </div>
    </div>
  );
}
