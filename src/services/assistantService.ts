import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  increment,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { firestorePaths } from "../lib/firestorePaths";
import {
  assistantConfig,
  isGeminiAssistantEnabled,
} from "../config/assistantConfig";
import type { AssistantMessage } from "../features/assistant/types";

const MESSAGE_LIMIT = 50;

export interface AssistantStats {
  totalMessages: number;
  lastUsedAt: Date | null;
}

export const DEFAULT_ASSISTANT_STATS: AssistantStats = {
  totalMessages: 0,
  lastUsedAt: null,
};

function mapMessage(snap: QueryDocumentSnapshot): AssistantMessage {
  const data = snap.data();
  const createdAt = data.createdAt;
  return {
    id: snap.id,
    role: data.role as "user" | "assistant",
    content: String(data.content ?? ""),
    createdAt:
      createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
  };
}

export function parseAssistantStats(
  data: Record<string, unknown> | undefined
): AssistantStats {
  const raw = data?.assistantStats;
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_ASSISTANT_STATS };
  }
  const stats = raw as Record<string, unknown>;
  const lastUsedAt = stats.lastUsedAt;
  return {
    totalMessages: Math.max(0, Number(stats.totalMessages) || 0),
    lastUsedAt:
      lastUsedAt instanceof Timestamp
        ? lastUsedAt.toDate()
        : lastUsedAt instanceof Date
          ? lastUsedAt
          : null,
  };
}

/** Mock responses — used when provider is "mock". */
async function sendMockMessage(message: string): Promise<string> {
  const text = message.trim().toLowerCase();

  if (
    text.includes("coding") ||
    text.includes("focus") ||
    text.includes("study") ||
    text.includes("recommend")
  ) {
    return `Try searching:
- lofi coding
- chillhop focus
- synthwave programming`;
  }

  if (text.includes("phonk")) {
    return "Phonk is a genre inspired by Memphis rap with heavy bass and drift culture influences.";
  }

  if (
    text.includes("playlist") ||
    text.includes("create") ||
    text.includes("idea")
  ) {
    return `Night Coding Session

Genres:
- LoFi
- Chillhop
- Ambient`;
  }

  if (text.includes("jazz")) {
    return "Jazz features improvisation, swing rhythms, and rich harmonies — great for relaxed listening.";
  }

  if (text.includes("lofi") || text.includes("lo-fi")) {
    return "Lo-Fi hip hop blends mellow beats with vinyl crackle — perfect for studying or relaxing.";
  }

  return `I'm your music assistant ♪ Try asking:
- "Recommend music for coding"
- "Explain phonk"
- "Create playlist idea"`;
}

/**
 * Future Gemini path — call Cloud Function, NOT the Gemini API from React.
 *
 * Production: React → Firebase Auth (ID token) → Cloud Function → Gemini API
 */
async function sendGeminiMessage(
  message: string,
  userId?: string
): Promise<string> {
  const url = assistantConfig.cloudFunctionUrl?.trim();
  if (!url) {
    throw new Error("Assistant Cloud Function URL is not configured");
  }

  // Placeholder for future implementation:
  // const token = await auth.currentUser?.getIdToken();
  // const res = await fetch(url, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${token}`,
  //   },
  //   body: JSON.stringify({ message, userId }),
  // });
  // if (!res.ok) throw new Error("Assistant request failed");
  // const data = (await res.json()) as { reply: string };
  // return data.reply;

  void userId;
  void message;
  throw new Error("Gemini assistant is not enabled yet");
}

/**
 * Send a user message and receive an assistant reply.
 * Routes by assistantConfig.provider — UI stays unchanged when switching mock → gemini.
 */
export async function sendMessage(
  message: string,
  userId?: string
): Promise<string> {
  if (isGeminiAssistantEnabled()) {
    return sendGeminiMessage(message, userId);
  }
  return sendMockMessage(message);
}

export async function loadAssistantMessages(
  userId: string,
  max = MESSAGE_LIMIT
): Promise<AssistantMessage[]> {
  if (!userId) return [];

  try {
    const q = query(
      collection(db, firestorePaths.assistantMessages(userId)),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map(mapMessage).reverse();
  } catch {
    /* collection may not exist yet or rules offline */
    return [];
  }
}

async function updateAssistantStats(userId: string): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, firestorePaths.user(userId));
    await updateDoc(userRef, {
      "assistantStats.totalMessages": increment(1),
      "assistantStats.lastUsedAt": serverTimestamp(),
    });
  } catch {
    /* stats field may not exist yet — non-fatal */
  }
}

export async function saveAssistantMessage(
  userId: string,
  role: "user" | "assistant",
  content: string
): Promise<AssistantMessage> {
  const ref = await addDoc(
    collection(db, firestorePaths.assistantMessages(userId)),
    {
      role,
      content,
      createdAt: serverTimestamp(),
    }
  );
  await updateAssistantStats(userId);
  return {
    id: ref.id,
    role,
    content,
    createdAt: new Date(),
  };
}

export async function sendAssistantMessage(
  userId: string,
  userMessage: string
): Promise<{ user: AssistantMessage; assistant: AssistantMessage }> {
  const user = await saveAssistantMessage(userId, "user", userMessage);
  const replyText = await sendMessage(userMessage, userId);
  const assistant = await saveAssistantMessage(userId, "assistant", replyText);
  return { user, assistant };
}

export async function getAssistantStats(userId: string): Promise<AssistantStats> {
  if (!userId) return { ...DEFAULT_ASSISTANT_STATS };

  try {
    const snap = await getDoc(doc(db, firestorePaths.user(userId)));
    if (!snap.exists()) {
      return { ...DEFAULT_ASSISTANT_STATS };
    }
    return parseAssistantStats(snap.data() as Record<string, unknown>);
  } catch {
    return { ...DEFAULT_ASSISTANT_STATS };
  }
}

export async function clearAssistantHistory(userId: string): Promise<void> {
  if (!userId) return;

  try {
    const q = query(
      collection(db, firestorePaths.assistantMessages(userId)),
      limit(100)
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  } catch {
    /* empty or missing collection */
  }

  try {
    const userRef = doc(db, firestorePaths.user(userId));
    await updateDoc(userRef, {
      "assistantStats.totalMessages": 0,
      "assistantStats.lastUsedAt": null,
    });
  } catch {
    /* assistantStats may not exist yet */
  }
}
