/**
 * Assistant provider configuration.
 *
 * Production architecture (do NOT call Gemini from React directly):
 *   React → Firebase Auth → Cloud Function → Gemini API
 *
 * The API key belongs on the server / Cloud Function env, not in the client bundle.
 * VITE_GEMINI_API_KEY in .env.example is documentation only for future backend setup.
 */
export type AssistantProvider = "mock" | "gemini";

export const assistantConfig = {
  /** Active provider: "mock" today; switch to "gemini" when Cloud Function is ready. */
  provider: "mock" as AssistantProvider,
  /** When true, sendMessage routes through the backend Gemini proxy (not implemented yet). */
  geminiEnabled: false,
  /** Future Cloud Function endpoint — e.g. https://us-central1-PROJECT.cloudfunctions.net/assistantChat */
  cloudFunctionUrl: import.meta.env.VITE_ASSISTANT_API_URL ?? "",
} as const;

export function isGeminiAssistantEnabled(): boolean {
  return assistantConfig.provider === "gemini" && assistantConfig.geminiEnabled;
}
