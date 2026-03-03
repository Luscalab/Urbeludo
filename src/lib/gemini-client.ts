'use client';

/**
 * @fileOverview Cliente seguro para Gemini API via backend route.
 * Evita exposição de API keys no cliente.
 */

export interface GeminiClientOptions {
  model?: string;
  responseMimeType?: string;
}

export async function callGeminiAPI(
  prompt: string,
  options: GeminiClientOptions = {}
): Promise<string> {
  const { model = "gemini-1.5-flash", responseMimeType } = options;

  try {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model,
        responseMimeType,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || error.error || "Erro ao chamar Gemini");
    }

    const data = await response.json();
    return data.content;
  } catch (error: any) {
    throw new Error(`Gemini Client Error: ${error.message}`);
  }
}
