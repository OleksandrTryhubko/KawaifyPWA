export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string | Date;
}

export interface AssistantSession {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
