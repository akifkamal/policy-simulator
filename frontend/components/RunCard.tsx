"use client";

import { useState } from "react";
import Link from "next/link";
import type { Run } from "@/lib/types";
import { api } from "@/lib/api";
import RunStatusBadge from "./RunStatusBadge";
import { CheckCircle, GitCompare, ChevronDown, ChevronRight } from "lucide-react";
import RunDetail from "./RunDetail";
import clsx from "clsx";

interface Props {
  run: Run;
  workspaceId: number;
  onUpdated: (run: Run) => void;
  compareMode?: boolean;
  compareSelected?: boolean;
  onToggleCompare?: (runId: number) => void;
}

export default function RunCard({ run, workspaceId, onUpdated, compareMode, compareSelected, onToggleCompare }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selecting, setSelecting] = useState(false);

  async function handleSelect() {
    setSelecting(true);
    try {
      const updated = await api.selectRun(run.id);
      onUpdated(updated);
    } finally {
      setSelecting(false);
    }
  }

  const date = new Date(run.created_at).toLocaleString();

  return (
    <div className={clsx(
      "bg-white rounded-lg border transition-shadow",
      run.selected ? "border-[#DA291C] shadow-md" : "border-gray-200",
      compareSelected && "ring-2 ring-blue-400"
    )}>
      <div className="px-4 py-3 flex items-start gap-3">
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-0.5 text-gray-400 hover:text-gray-700 flex-shrink-0"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <RunStatusBadge status={run.status} />
            {run.selected && (
              <span className="inline-flex items-center gap-1 text-xs text-[#DA291C] font-medium">
                <CheckCircle size={12} /> Selected
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">{date}</span>
          </div>
          <p className="mt-1 text-sm text-gray-800 font-medium line-clamp-2">{run.scenario_text}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {compareMode && (
            <button
              onClick={() => onToggleCompare?.(run.id)}
              className={clsx(
                "p-1.5 rounded-md text-xs border transition-colors",
                compareSelected
                  ? "bg-blue-100 border-blue-400 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              )}
              title="Add to comparison"
            >
              <GitCompare size={14} />
            </button>
          )}
          {run.status === "complete" && !run.selected && (
            <button
              onClick={handleSelect}
              disabled={selecting}
              className="text-xs px-2.5 py-1 bg-[#DA291C] text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Select
            </button>
          )}
        </div>
      </div>

      {expanded && run.status === "complete" && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <RunDetail run={run} />
        </div>
      )}

      {expanded && run.status === "failed" && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <RunDetail run={run} />
        </div>
      )}

      {expanded && (run.status === "pending" || run.status === "running") && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 text-sm text-gray-500 italic">
          Simulation in progress…
        </div>
      )}
    </div>
  );
}
