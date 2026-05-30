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
import type { AssistantMessage } from "../features/assistant/types";

const MESSAGE_LIMIT = 50;

export interface AssistantStats {
  totalMessages: number;
  lastUsedAt: Date | null;
}

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

/** Mock music assistant — replace with Gemini/OpenAI via backend later */
export async function sendMessage(message: string): Promise<string> {
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

export async function loadAssistantMessages(
  userId: string,
  max = MESSAGE_LIMIT
): Promise<AssistantMessage[]> {
  const q = query(
    collection(db, firestorePaths.assistantMessages(userId)),
    orderBy("createdAt", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapMessage).reverse();
}

async function updateAssistantStats(userId: string): Promise<void> {
  const userRef = doc(db, firestorePaths.user(userId));
  await updateDoc(userRef, {
    "assistantStats.totalMessages": increment(1),
    "assistantStats.lastUsedAt": serverTimestamp(),
  });
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
  const replyText = await sendMessage(userMessage);
  const assistant = await saveAssistantMessage(userId, "assistant", replyText);
  return { user, assistant };
}

export async function getAssistantStats(userId: string): Promise<AssistantStats> {
  const snap = await getDoc(doc(db, firestorePaths.user(userId)));
  if (!snap.exists()) {
    return { totalMessages: 0, lastUsedAt: null };
  }
  const stats = snap.data().assistantStats as
    | { totalMessages?: number; lastUsedAt?: Timestamp }
    | undefined;
  return {
    totalMessages: stats?.totalMessages ?? 0,
    lastUsedAt:
      stats?.lastUsedAt instanceof Timestamp ? stats.lastUsedAt.toDate() : null,
  };
}

export async function clearAssistantHistory(userId: string): Promise<void> {
  const q = query(
    collection(db, firestorePaths.assistantMessages(userId)),
    limit(100)
  );
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));

  const userRef = doc(db, firestorePaths.user(userId));
  await updateDoc(userRef, {
    "assistantStats.totalMessages": 0,
    "assistantStats.lastUsedAt": null,
  });
}
