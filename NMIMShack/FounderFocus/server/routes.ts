import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertChatSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Specialized prompts for different founder needs
const PROMPT_TEMPLATES = {
  ideaValidation: `You are an experienced startup advisor specializing in idea validation. Analyze the following business idea and provide structured feedback in these sections:

Market Opportunity:
Target Market:
Competitive Analysis:
Potential Challenges:
Unique Value Proposition:
Next Steps:

Question: {message}`,

  strategyAdvice: `You are a strategic startup advisor with expertise in company building. Provide detailed guidance for the following question, structured in these sections:

Strategic Analysis:
Resource Allocation:
Growth Opportunities:
Risk Assessment:
Implementation Plan:
Key Metrics:

Question: {message}`,

  founderSupport: `You are a solo founder mentor specializing in founder well-being and success. Address the following concern with practical advice, structured in these sections:

Problem Analysis:
Immediate Actions:
Long-term Solutions:
Resource Recommendations:
Support Network:
Success Metrics:

Question: {message}`
};

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/chat-history", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const history = await storage.getChatHistory(req.user.id);
    res.json(history);
  });

  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const parseResult = insertChatSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    try {
      // Determine the type of query based on keywords
      const message = parseResult.data.message.toLowerCase();
      let promptTemplate;

      if (message.includes("validate") || message.includes("idea") || message.includes("market")) {
        promptTemplate = PROMPT_TEMPLATES.ideaValidation;
      } else if (message.includes("strategy") || message.includes("plan") || message.includes("growth")) {
        promptTemplate = PROMPT_TEMPLATES.strategyAdvice;
      } else {
        promptTemplate = PROMPT_TEMPLATES.founderSupport;
      }

      const prompt = promptTemplate.replace("{message}", parseResult.data.message);
      const result = await model.generateContent(prompt);
      const response = result.response.text()
        .replace(/[#*•-]/g, '') // Remove all special characters
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n');

      const chat = await storage.createChatHistory(req.user.id, {
        ...parseResult.data,
        response,
      });

      res.json(chat);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        message: "Failed to generate response", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}