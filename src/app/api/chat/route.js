import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not configured." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Find the first user message. Gemini history must start with a 'user' role.
    const firstUserIndex = messages.findIndex(msg => msg.role === "user");
    const historyMessages = firstUserIndex !== -1 ? messages.slice(firstUserIndex, -1) : [];

    // Format history for Gemini
    const history = historyMessages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 500,
      },
      systemInstruction: {
        role: "system",
        parts: [{ text: "You are FilmHub AI, a helpful and friendly assistant for the FilmHub website. FilmHub is a premium cinematic platform where users can watch movies, TV shows, Sinhala movies, and Korean dramas. Your goal is to help users find content, explain features like 'My List', and provide a premium experience. Use a helpful, enthusiastic, and slightly cinematic tone. Keep responses relatively concise." }],
      },
    });

    const userMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Chat API error details:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch response from AI.",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
