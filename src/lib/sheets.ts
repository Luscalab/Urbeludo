/**
 * @fileOverview Serviço de Sincronização com Google Sheets - 100% Client-Side.
 * Projetado para funcionar dentro de um APK (Capacitor) sem erros de CORS.
 */

export interface SheetsPayload {
  paciente: string;
  volume: number;
  sustentacao: number;
  tentativas: number;
  feedback: string;
  relatorio: string;
  fase: string;
}

/**
 * Envia os dados da sessão para a planilha via Google Apps Script.
 * Usa mode: 'no-cors' para garantir que a requisição seja enviada sem bloqueios do navegador.
 */
export const saveToSheets = async (data: SheetsPayload) => {
  const url = process.env.NEXT_PUBLIC_SHEETS_API_URL || "https://script.google.com/macros/s/AKfycbzsSKmrYw5AIEvDdDq0_jkaoo7mdS85GVOEloaEWPYmYtRZgElEY9GfE5kTMAHT34bo7Q/exec";

  if (!url || url.includes("COLE_AQUI")) {
    console.warn("Sheets: URL da API não configurada corretamente.");
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }),
    });
    console.log("✅ Dados sincronizados com a planilha clínica.");
  } catch (error) {
    console.error("❌ Erro ao enviar dados para Sheets:", error);
  }
};
