export interface User {
  id: number;
  email: string;
}

export interface Workspace {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface Message {
  id: number;
  workspace_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export type RunStatus = "pending" | "running" | "complete" | "failed";

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface Run {
  id: number;
  workspace_id: number;
  scenario_text: string;
  status: RunStatus;
  parameters: string;
  narration: string;
  tables_json: string;
  charts_json: string;
  error_message: string;
  selected: boolean;
  created_at: string;
}

export interface LeadershipRun {
  id: number;
  workspace_id: number;
  workspace_name: string;
  scenario_text: string;
  narration: string;
  tables_json: string;
  charts_json: string;
  created_at: string;
}
