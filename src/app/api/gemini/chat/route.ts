import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("GEMINI_API_KEY not configured in environment");
}

interface RequestBody {
  prompt: string;
  model?: string;
  responseMimeType?: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "API Key não configurada" },
        { status: 500 }
      );
    }

    const body: RequestBody = await request.json();
    const { prompt, model = "gemini-1.5-flash", responseMimeType } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt é obrigatório" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const generativeModel = genAI.getGenerativeModel({ model });

    const config: any = {};
    if (responseMimeType) {
      config.responseMimeType = responseMimeType;
    }

    const result = await generativeModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: config as any,
    });

    const text = result.response.text();

    return NextResponse.json({
      success: true,
      content: text,
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message);
    return NextResponse.json(
      { 
        error: "Erro ao processar requisição",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
