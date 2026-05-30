/**
 * Assistant provider configuration.
 *
 * Production: React → Firebase Auth → Cloud Function → Gemini API
 * API key lives only on the server (GEMINI_API_KEY secret).
 */
export type AssistantProvider = "mock" | "gemini";

/** Deployed assistantChat endpoint (fallback when VITE_* is missing in bundle). */
export const DEFAULT_ASSISTANT_API_URL =
  "https://us-central1-kawaify-pwa.cloudfunctions.net/assistantChat";

export const assistantConfig = {
  provider: "gemini" as AssistantProvider,
  geminiEnabled: true,
} as const;

/** Read URL at call time so dev .env changes apply after HMR/restart. */
export function getCloudFunctionUrl(): string {
  const fromEnv = import.meta.env.VITE_ASSISTANT_API_URL;
  const trimmed =
    typeof fromEnv === "string" ? fromEnv.trim() : "";
  return trimmed || DEFAULT_ASSISTANT_API_URL;
}

export function isGeminiAssistantEnabled(): boolean {
  return assistantConfig.provider === "gemini" && assistantConfig.geminiEnabled;
}
