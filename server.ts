import { localApiOnly } from './local-api-guard.mjs';
import express from "express";
import multer from "multer";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import { createServer as createViteServer } from "vite";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
app.use('/api', localApiOnly(() => PORT));
  const PORT = 3000;

  // Lazy initialize the AI client
  let aiClient: GoogleGenAI | null = null;
  function getAiClient() {
    if (!aiClient) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: { "User-Agent": "aistudio-build" },
        },
      });
    }
    return aiClient;
  }

  app.post("/api/agenda", upload.single("document"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No document uploaded." });
    }

    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: req.file.mimetype,
              data: req.file.buffer.toString("base64"),
            },
          },
          {
            text: "Analyze this document and create a detailed meeting agenda from it. Identify the key stakeholders, high-level summary, and a timeline view of the meeting (topics, time to spend in minutes, order). Ensure output aligns with the schema.",
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "High-level context and summary of the meeting based on the document.",
              },
              title: {
                type: Type.STRING,
                description: "A succinct meeting title.",
              },
              stakeholders: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of stakeholders or attendees required mapping the context.",
              },
              agendaItems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    order: {
                      type: Type.INTEGER,
                      description: "Order of the item (1, 2, 3...).",
                    },
                    topic: {
                      type: Type.STRING,
                      description: "Topic to cover in this agenda block.",
                    },
                    durationMinutes: {
                      type: Type.INTEGER,
                      description: "Suggested time to spend in minutes.",
                    },
                    speakers: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Stakeholders driving or speaking on this topic, if any.",
                    },
                  },
                  required: ["order", "topic", "durationMinutes"],
                },
              },
            },
            required: ["summary", "title", "stakeholders", "agendaItems"],
          },
        },
      });

      const jsonStr = response.text || "{}";
      const data = JSON.parse(jsonStr);
      res.json(data);
    } catch (error: any) {
      console.error("Error generating agenda:", error);
      res.status(500).json({ error: error.message || "Failed to generate agenda." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
