
/**
 * @fileOverview Serviço de Sincronização com Google Sheets via Apps Script.
 * Permite o acompanhamento clínico remoto dos exercícios de psicomotricidade.
 * Versão otimizada para Capacitor (Android/APK).
 */

export interface SheetsPayload {
  paciente: string;
  volume: number;
  sustentacao: number;
  tentativas: number;
  feedback: string;
  relatorio: string;
  fase: string;
  data?: string;
}

export const sincronizarComPlanilha = async (dados: SheetsPayload) => {
  const url = process.env.NEXT_PUBLIC_SHEETS_API_URL || "https://script.google.com/macros/s/AKfycbzsSKmrYw5AIEvDdDq0_jkaoo7mdS85GVOEloaEWPYmYtRZgElEY9GfE5kTMAHT34bo7Q/exec";

  if (!url || url.includes("COLE_AQUI")) {
    console.warn("Sheets: URL da API não configurada ou inválida.");
    return;
  }

  try {
    // Usamos 'no-cors' para compatibilidade máxima com Capacitor/Android WebView.
    // O Google Apps Script aceita o POST, mas não retorna cabeçalhos CORS.
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(dados),
    });
    console.log("✅ Sincronização Ludo-Sheets enviada para a Aura.");
  } catch (error) {
    console.error("❌ Falha na sincronização Ludo-Sheets:", error);
  }
};
