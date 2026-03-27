import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function* streamChat(messages: Message[]) {
  const model = "gemini-3-flash-preview";
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: "You are Moon, a helpful, friendly FAQ chatbot. Provide clear, concise, and accurate information. Format your responses using Markdown for better readability.",
    },
    history: history as any,
  });

  const lastMessage = messages[messages.length - 1].content;
  const result = await chat.sendMessageStream({ message: lastMessage });

  for await (const chunk of result) {
    yield chunk.text;
  }
}
