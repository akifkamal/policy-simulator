"use client";

import { useEffect, useState } from "react";
import type { Run } from "@/lib/types";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const STAGES = [
  { threshold: 0, label: "Queuing simulation..." },
  { threshold: 5, label: "Analyzing your policy scenario..." },
  { threshold: 15, label: "Searching for relevant data..." },
  { threshold: 30, label: "Building and running models..." },
  { threshold: 60, label: "Generating insights and narration..." },
];

function getStageLabel(elapsedSeconds: number): string {
  let label = STAGES[0].label;
  for (const stage of STAGES) {
    if (elapsedSeconds >= stage.threshold) label = stage.label;
  }
  return label;
}

export default function RunProgressIndicator({ run }: { run: Run }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (run.status !== "pending" && run.status !== "running") return;
    const start = new Date(run.created_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [run.status, run.created_at]);

  if (run.status === "complete") {
    return (
      <div className="flex justify-start">
        <div className="bg-green-50 border border-green-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
          <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
            <CheckCircle2 size={16} />
            Simulation complete
          </div>
        </div>
      </div>
    );
  }

  if (run.status === "failed") {
    return (
      <div className="flex justify-start">
        <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
          <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
            <XCircle size={16} />
            Simulation failed
          </div>
          {run.error_message && (
            <p className="mt-1.5 text-xs text-red-600">{run.error_message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] min-w-[280px]">
        <div className="flex items-center gap-2 text-[#1B2A4A] text-sm font-medium">
          <Loader2 size={16} className="animate-spin" />
          {run.status === "pending" ? "Simulation queued..." : "Running simulation..."}
        </div>

        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 h-full bg-[#1B2A4A] rounded-full"
            style={{
              animation: "indeterminate-progress 2s ease-in-out infinite",
            }}
          />
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes indeterminate-progress {
              0% { width: 0%; left: 0%; }
              50% { width: 40%; left: 30%; }
              100% { width: 0%; left: 100%; }
            }
          `}} />
        </div>

        <p className="mt-2 text-xs text-gray-500">{getStageLabel(elapsed)}</p>
      </div>
    </div>
  );
}
