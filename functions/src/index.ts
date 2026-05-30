import * as admin from "firebase-admin";
import {GoogleGenAI} from "@google/genai";
import cors from "cors";
import {setGlobalOptions} from "firebase-functions";
import {defineSecret} from "firebase-functions/params";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

setGlobalOptions({maxInstances: 10});

const geminiApiKey = defineSecret("GEMINI_API_KEY");

if (!admin.apps.length) {
  admin.initializeApp();
}

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://kawaify-pwa.web.app",
  "https://kawaify-pwa.firebaseapp.com",
]);

const corsHandler = cors({
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (
      ALLOWED_ORIGINS.has(origin) ||
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      callback(null, true);
      return;
    }
    callback(null, true);
  },
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

const SYSTEM_PROMPT = `Kawaify AI is a compact music assistant inside a PWA music application.

Focus on:
- music recommendations
- playlists
- moods
- genres
- artists

Keep answers short and useful.

Do not behave like a full ChatGPT clone.`;

function readBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice("Bearer ".length).trim();
  return token || null;
}

export const assistantChat = onRequest(
  {secrets: [geminiApiKey], invoker: "public"},
  (req, res) => {
    corsHandler(req, res, () => {
      void (async () => {
        if (req.method === "OPTIONS") {
          res.status(204).send("");
          return;
        }

        if (req.method !== "POST") {
          res.status(405).json({error: "Method not allowed"});
          return;
        }

        const idToken = readBearerToken(req.headers.authorization);
        if (!idToken) {
          res.status(401).json({error: "Unauthorized"});
          return;
        }

        try {
          await admin.auth().verifyIdToken(idToken);
        } catch (err) {
          logger.warn("Invalid ID token", err);
          res.status(401).json({error: "Unauthorized"});
          return;
        }

        const body = req.body as {message?: unknown} | undefined;
        const userMessage =
          typeof body?.message === "string" ? body.message.trim() : "";
        if (!userMessage) {
          res.status(400).json({error: "message is required"});
          return;
        }

        const apiKey = geminiApiKey.value();
        if (!apiKey) {
          logger.error("GEMINI_API_KEY secret is empty");
          res.status(503).json({error: "Assistant unavailable"});
          return;
        }

        try {
          const ai = new GoogleGenAI({apiKey});
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userMessage,
            config: {
              systemInstruction: SYSTEM_PROMPT,
            },
          });

          const reply = response.text?.trim() ?? "";
          if (!reply) {
            res.status(502).json({error: "Empty model response"});
            return;
          }

          res.status(200).json({reply});
        } catch (err) {
          logger.error("Gemini request failed", err);
          res.status(503).json({error: "Assistant unavailable"});
        }
      })();
    });
  },
);
