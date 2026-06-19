export type ChatRole = "user" | "assistant";

export type ChatMsg = {
  role: ChatRole;
  content: string;
};

export type Evidence = {
  source?: string;
  snippet?: string;
  score?: number | null;
  meta?: Record<string, any>;
};

export type ChatResponse = {
  answer: string;
  intent: string;
  parsed: Record<string, any>;
  evidence: Evidence[];
};