"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { LeadershipRun } from "@/lib/types";
import RunDetail from "@/components/RunDetail";
import type { Run } from "@/lib/types";
import { Crown, ChevronDown, ChevronRight } from "lucide-react";

export default function LeadershipPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<LeadershipRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    api.getLeadership()
      .then(setRuns)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Crown size={24} className="text-[#DA291C]" />
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Leadership View</h1>
          <p className="text-gray-500 text-sm mt-0.5">Approved policy scenarios selected for leadership review.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading…</div>
      ) : runs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Crown size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No approved scenarios yet.</p>
          <p className="text-xs mt-1">Policy makers can select a completed run to publish it here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => (
            <div key={run.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggle(run.id)}
                className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="mt-0.5 text-gray-400">
                  {expanded.has(run.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link
                      href={`/workspaces/${run.workspace_id}`}
                      className="text-xs font-semibold text-[#1B2A4A] hover:text-[#DA291C] transition-colors uppercase tracking-wide"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {run.workspace_name}
                    </Link>
                    <span className="inline-flex items-center gap-1 text-xs text-[#DA291C] font-medium">
                      ★ Approved
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(run.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{run.scenario_text}</p>
                  {!expanded.has(run.id) && run.narration && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {run.narration.replace(/^#+\s.*/gm, "").trim().slice(0, 200)}…
                    </p>
                  )}
                </div>
              </button>

              {expanded.has(run.id) && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <RunDetail run={run as unknown as Run} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
