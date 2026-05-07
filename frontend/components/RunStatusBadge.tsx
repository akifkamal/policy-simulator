import type { RunStatus } from "@/lib/types";
import clsx from "clsx";

const config: Record<RunStatus, { label: string; classes: string }> = {
  pending:  { label: "Pending",  classes: "bg-yellow-100 text-yellow-800" },
  running:  { label: "Running",  classes: "bg-blue-100 text-blue-800 animate-pulse" },
  complete: { label: "Complete", classes: "bg-green-100 text-green-800" },
  failed:   { label: "Failed",   classes: "bg-red-100 text-red-800" },
};

export default function RunStatusBadge({ status }: { status: RunStatus }) {
  const { label, classes } = config[status] ?? config.pending;
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", classes)}>
      {label}
    </span>
  );
}
