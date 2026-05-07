import { getToken } from "./auth";
import type { LeadershipRun, Message, Run, User, Workspace } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/auth/me"),

  getWorkspaces: () => request<Workspace[]>("/workspaces"),
  createWorkspace: (name: string, description: string) =>
    request<Workspace>("/workspaces", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),
  getWorkspace: (id: number) => request<Workspace>(`/workspaces/${id}`),

  getMessages: (workspaceId: number) =>
    request<Message[]>(`/workspaces/${workspaceId}/messages`),

  createRun: (workspaceId: number, scenario_text: string) =>
    request<Run>(`/workspaces/${workspaceId}/runs`, {
      method: "POST",
      body: JSON.stringify({ scenario_text }),
    }),
  getRuns: (workspaceId: number) =>
    request<Run[]>(`/workspaces/${workspaceId}/runs`),
  getRun: (runId: number) => request<Run>(`/runs/${runId}`),
  selectRun: (runId: number) =>
    request<Run>(`/runs/${runId}/select`, { method: "PATCH" }),

  getLeadership: () => request<LeadershipRun[]>("/leadership"),
};
