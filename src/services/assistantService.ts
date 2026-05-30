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
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { firestorePaths } from "../lib/firestorePaths";
import {
  assistantConfig,
  getCloudFunctionUrl,
  isGeminiAssistantEnabled,
} from "../config/assistantConfig";
import type { AssistantMessage } from "../features/assistant/types";

const MESSAGE_LIMIT = 50;
const ASSISTANT_UNAVAILABLE = "Assistant temporarily unavailable";
const ASSISTANT_URL_NOT_CONFIGURED = "Assistant URL is not configured";
const ASSISTANT_SIGN_IN_REQUIRED = "Please sign in to use Kawaify AI";

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

/** Mock responses — only when provider === "mock". */
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

/** Resolve Firebase ID token (waits briefly for auth sync after login). */
async function resolveIdToken(userId?: string): Promise<string | null> {
  const immediate = auth.currentUser;
  if (immediate && (!userId || immediate.uid === userId)) {
    return immediate.getIdToken();
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      window.clearTimeout(timeout);
      unsubscribe();
      if (!firebaseUser) {
        resolve(null);
        return;
      }
      if (userId && firebaseUser.uid !== userId) {
        resolve(null);
        return;
      }
      void firebaseUser.getIdToken().then(resolve).catch(() => resolve(null));
    });
  });
}

/**
 * Gemini via Cloud Function — never call the Gemini API from React.
 */
async function sendGeminiMessage(
  message: string,
  userId?: string
): Promise<string> {
  const url = getCloudFunctionUrl();

  console.debug("[Kawaify AI] Gemini enabled:", isGeminiAssistantEnabled());
  console.debug("[Kawaify AI] provider:", assistantConfig.provider);
  console.debug("[Kawaify AI] cloudFunctionUrl:", url);
  console.debug("[Kawaify AI] env VITE_ASSISTANT_API_URL:", import.meta.env.VITE_ASSISTANT_API_URL);
  console.debug("[Kawaify AI] currentUser:", auth.currentUser?.uid);
  console.debug("[Kawaify AI] userId arg:", userId);

  if (!url) {
    console.error("[Kawaify AI] Assistant URL is not configured");
    return ASSISTANT_URL_NOT_CONFIGURED;
  }

  const token = await resolveIdToken(userId);
  if (!token) {
    console.error("[Kawaify AI] No Firebase user / ID token for assistant request");
    return ASSISTANT_SIGN_IN_REQUIRED;
  }

  try {
    console.debug("[Kawaify AI] POST assistantChat started");
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({message: message.trim()}),
    });

    console.debug("[Kawaify AI] POST assistantChat status:", res.status);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(
        "[Kawaify AI] Cloud Function error:",
        res.status,
        errorText
      );
      return ASSISTANT_UNAVAILABLE;
    }

    const data = (await res.json()) as {reply?: unknown};
    const reply = typeof data.reply === "string" ? data.reply.trim() : "";
    if (!reply) {
      console.error("[Kawaify AI] Empty reply from Cloud Function");
      return ASSISTANT_UNAVAILABLE;
    }
    return reply;
  } catch (error) {
    console.error("[Kawaify AI] Gemini request failed:", error);
    return ASSISTANT_UNAVAILABLE;
  }
}

/**
 * Send a user message and receive an assistant reply.
 */
export async function sendMessage(
  message: string,
  userId?: string
): Promise<string> {
  console.debug("[Kawaify AI] sendMessage called");
  console.debug("[Kawaify AI] Gemini enabled:", isGeminiAssistantEnabled());
  console.debug("[Kawaify AI] provider:", assistantConfig.provider);

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
    /* non-fatal */
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
  console.debug("[Kawaify AI] sendAssistantMessage called", {userId});

  const user = await saveAssistantMessage(userId, "user", userMessage);
  const replyText = await sendMessage(userMessage, userId);
  const assistant = await saveAssistantMessage(userId, "assistant", replyText);
  return {user, assistant};
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
    /* empty */
  }

  try {
    const userRef = doc(db, firestorePaths.user(userId));
    await updateDoc(userRef, {
      "assistantStats.totalMessages": 0,
      "assistantStats.lastUsedAt": null,
    });
  } catch {
    /* non-fatal */
  }
}
