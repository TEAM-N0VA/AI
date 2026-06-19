import Constants from "expo-constants";
import { ChatMsg, ChatResponse } from "./types";

const BACKEND_PORT = 8000;

export function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  // Expo записывает LAN-IP dev-сервера в hostUri ("192.168.x.x:8081")
  // берём только IP и подставляем порт бэкенда
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:${BACKEND_PORT}`;
  }
  return `http://127.0.0.1:${BACKEND_PORT}`;
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