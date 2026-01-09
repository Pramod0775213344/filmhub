import { NextResponse } from "next/server";
import { validateOrigin, securityError, validateEnv } from "@/utils/security";

export async function POST(req) {
  if (!validateOrigin(req)) {
    return securityError('Unauthorized origin');
  }

  try {
    const { messages } = await req.json();
    if (!validateEnv(['GEMINI_API_KEY'])) {
      return securityError('API Key not configured', 500);
    }
    const apiKey = process.env.GEMINI_API_KEY;

    // අපි මෙතනදී v1beta වෙනුවට ස්ථාවර v1 URL එක කෙලින්ම පාවිච්චි කරනවා
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const lastMessage = messages[messages.length - 1].content;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: lastMessage }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || "Google API Error" }, { status: response.status });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ text: aiText });

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}