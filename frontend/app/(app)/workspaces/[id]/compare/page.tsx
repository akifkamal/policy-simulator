"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Run } from "@/lib/types";
import RunDetail from "@/components/RunDetail";
import RunStatusBadge from "@/components/RunStatusBadge";
import { ArrowLeft } from "lucide-react";

export default function ComparePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const workspaceId = parseInt(id, 10);
  const searchParams = useSearchParams();
  const router = useRouter();

  const runIds = (searchParams.get("runs") ?? "")
    .split(",")
    .map(Number)
    .filter(Boolean);

  const [runs, setRuns] = useState<(Run | null)[]>([null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (runIds.length < 2) {
      router.push(`/workspaces/${workspaceId}`);
      return;
    }
    Promise.all([api.getRun(runIds[0]), api.getRun(runIds[1])])
      .then(([a, b]) => setRuns([a, b]))
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="p-8 text-gray-400 text-sm">Loading comparison…</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href={`/workspaces/${workspaceId}`} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-bold text-[#1B2A4A]">Run Comparison</h1>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {runs.map((run, i) => (
          <div key={i} className={`flex-1 overflow-y-auto p-6 ${i === 0 ? "border-r border-gray-200" : ""}`}>
            {run ? (
              <>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Run {run.id}</span>
                    <RunStatusBadge status={run.status} />
                    {run.selected && (
                      <span className="text-xs text-[#DA291C] font-medium">★ Selected</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{run.scenario_text}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(run.created_at).toLocaleString()}</p>
                </div>
                <hr className="border-gray-200 mb-4" />
                <RunDetail run={run} />
              </>
            ) : (
              <div className="text-gray-400 text-sm">Run not found</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
