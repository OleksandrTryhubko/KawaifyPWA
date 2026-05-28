import type { AssistantMessage, AssistantSession } from "./types";

/**
 * Placeholder service. Real AI/Gemini integration should happen on backend/server route.
 * Do not call external LLM providers directly from frontend.
 */
export async function sendAssistantPrompt(_prompt: string): Promise<string> {
  return "AI assistant coming soon ♪";
}

export function getAssistantSessionPath(userId: string, sessionId: string): string {
  return `users/${userId}/assistantSessions/${sessionId}`;
}

export function getAssistantMessagesPath(
  userId: string,
  sessionId: string
): string {
  return `${getAssistantSessionPath(userId, sessionId)}/messages`;
}

export function createAssistantSessionPlaceholder(
  title = "New session"
): AssistantSession {
  const now = new Date().toISOString();
  return {
    id: `session-${Date.now()}`,
    title,
    createdAt: now,
    updatedAt: now,
  };
}

export function createAssistantMessagePlaceholder(
  role: "user" | "assistant",
  content: string
): AssistantMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}
