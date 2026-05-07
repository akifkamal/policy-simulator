"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Message, Run, Workspace } from "@/lib/types";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import RunCard from "@/components/RunCard";
import RunProgressIndicator from "@/components/RunProgressIndicator";
import { ArrowLeft, GitCompare } from "lucide-react";

const POLL_INTERVAL = 3000;

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const workspaceId = parseInt(id, 10);
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([
      api.getWorkspace(workspaceId),
      api.getMessages(workspaceId),
      api.getRuns(workspaceId),
    ])
      .then(([ws, msgs, rs]) => {
        setWorkspace(ws);
        setMessages(msgs);
        setRuns(rs);
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [workspaceId, router]);

  // Poll active runs
  useEffect(() => {
    const active = runs.filter((r) => r.status === "pending" || r.status === "running");
    if (active.length === 0) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    if (!pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        const updated = await Promise.all(active.map((r) => api.getRun(r.id)));
        setRuns((prev) =>
          prev.map((r) => {
            const u = updated.find((u) => u.id === r.id);
            return u ?? r;
          })
        );
        // Refresh messages when a run completes
        const justCompleted = updated.filter(
          (u) => u.status === "complete" || u.status === "failed"
        );
        if (justCompleted.length > 0) {
          const msgs = await api.getMessages(workspaceId);
          setMessages(msgs);
        }
      }, POLL_INTERVAL);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [runs, workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(text: string) {
    const run = await api.createRun(workspaceId, text);
    setRuns((prev) => [run, ...prev]);
    const msgs = await api.getMessages(workspaceId);
    setMessages(msgs);
  }

  function handleRunUpdated(updated: Run) {
    setRuns((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  function toggleCompare(runId: number) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(runId)) next.delete(runId);
      else if (next.size < 2) next.add(runId);
      return next;
    });
  }

  const canCompare = compareIds.size === 2;
  const activeRun = runs.find((r) => r.status === "pending" || r.status === "running") ?? null;

  if (loading) {
    return <div className="p-8 text-gray-400 text-sm">Loading workspace…</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/workspaces" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[#1B2A4A] truncate">{workspace?.name}</h1>
          {workspace?.description && (
            <p className="text-xs text-gray-500 truncate">{workspace.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {compareMode && canCompare && (
            <Link
              href={`/workspaces/${workspaceId}/compare?runs=${[...compareIds].join(",")}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <GitCompare size={14} />
              Compare
            </Link>
          )}
          <button
            onClick={() => { setCompareMode((v) => !v); setCompareIds(new Set()); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              compareMode ? "bg-blue-50 border-blue-300 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <GitCompare size={14} />
            {compareMode ? "Cancel Compare" : "Compare Runs"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-0">
        {/* Chat panel */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-gray-200">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#f8f9fa]">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-12">
                <p className="font-medium">Start a simulation</p>
                <p className="text-xs mt-1">Describe your policy scenario below to begin.</p>
              </div>
            )}
            <MessageList messages={messages} />
            {activeRun && <RunProgressIndicator run={activeRun} />}
            <div ref={bottomRef} />
          </div>
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <ChatInput onSubmit={handleSubmit} disabled={!!activeRun} activeRunStatus={activeRun?.status ?? null} />
          </div>
        </div>

        {/* Runs panel */}
        <div className="w-96 flex-shrink-0 overflow-y-auto bg-white">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Simulation Runs
                {runs.length > 0 && <span className="ml-1.5 text-gray-400 font-normal">({runs.length})</span>}
              </h2>
            </div>
            {compareMode && (
              <p className="text-xs text-blue-600 mb-3">
                Select 2 runs to compare. {compareIds.size}/2 selected.
              </p>
            )}
            {runs.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No runs yet. Submit a scenario to start.</p>
            ) : (
              <div className="space-y-3">
                {runs.map((run) => (
                  <RunCard
                    key={run.id}
                    run={run}
                    workspaceId={workspaceId}
                    onUpdated={handleRunUpdated}
                    compareMode={compareMode}
                    compareSelected={compareIds.has(run.id)}
                    onToggleCompare={toggleCompare}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
