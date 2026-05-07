"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import type { RunStatus } from "@/lib/types";

interface Props {
  onSubmit: (text: string) => Promise<void>;
  disabled?: boolean;
  activeRunStatus?: RunStatus | null;
}

export default function ChatInput({ onSubmit, disabled, activeRunStatus }: Props) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text || loading) return;
    setLoading(true);
    try {
      await onSubmit(text);
      setValue("");
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  const isBlocked = disabled || loading;

  return (
    <div>
      {activeRunStatus && (
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
          <Loader2 size={12} className="animate-spin" />
          <span>Simulation {activeRunStatus === "pending" ? "queued" : "running"} — input disabled until complete</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1B2A4A]">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            disabled={isBlocked}
            placeholder={isBlocked ? "Waiting for simulation to finish..." : "Describe a policy scenario… (e.g. 'What is the impact of a 2% interest rate cut on housing starts in Ontario over the next 5 years?')"}
            className="w-full px-4 py-3 text-sm resize-none bg-white focus:outline-none disabled:opacity-50"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim() || isBlocked}
          className="p-3 bg-[#DA291C] text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-40 flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
