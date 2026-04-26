import { ChatMsg, ChatResponse } from "./types";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

export function getBaseUrl() {
  // Android 에뮬레이터면 보통 10.0.2.2 
  // iOS simulator / web / local mac: 127.0.0.1 OK
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
}

export async function health() {
  const r = await fetch(`${getBaseUrl()}/health`);
  if (!r.ok) throw new Error(`health failed: ${r.status}`);
  return r.json();
}

export async function chat(message: string, history: ChatMsg[]): Promise<ChatResponse> {
  const r = await fetch(`${getBaseUrl()}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`chat failed: ${r.status} ${t}`);
  }
  return r.json();
}