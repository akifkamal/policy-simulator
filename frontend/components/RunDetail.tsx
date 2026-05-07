"use client";

import type { Run, TableData } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  run: Run;
}

export default function RunDetail({ run }: Props) {
  const tables: TableData[] = run.tables_json ? JSON.parse(run.tables_json) : [];
  const charts: string[] = run.charts_json ? JSON.parse(run.charts_json) : [];

  if (run.status === "failed") {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-medium text-sm">Simulation failed</p>
        {run.error_message && (
          <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{run.error_message}</pre>
        )}
      </div>
    );
  }

  if (!run.narration) {
    return <p className="text-gray-400 text-sm italic">No results yet.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Narration */}
      <div className="prose prose-sm max-w-none text-gray-800">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{run.narration}</ReactMarkdown>
      </div>

      {/* Charts */}
      {charts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Charts</h3>
          <div className="grid grid-cols-1 gap-4">
            {charts.map((b64, i) => (
              <img
                key={i}
                src={`data:image/png;base64,${b64}`}
                alt={`Chart ${i + 1}`}
                className="rounded-lg border border-gray-200 w-full"
              />
            ))}
          </div>
        </div>
      )}

      {/* Tables */}
      {tables.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Tables</h3>
          <div className="space-y-4">
            {tables.map((table, i) => (
              <div key={i} className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {table.headers.map((h, j) => (
                        <th key={j} className="px-3 py-2 text-left font-medium text-gray-600 border-b border-gray-200">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 text-gray-700 border-b border-gray-100">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
