
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
  const url = process.env.NEXT_PUBLIC_SHEETS_API_URL;

  if (!url) {
    console.error("Sheets: URL da API não configurada (NEXT_PUBLIC_SHEETS_API_URL)");
    return;
  }

  try {
    // O Google Apps Script não retorna cabeçalhos CORS adequados, 
    // então o modo 'no-cors' é essencial para o Capacitor/Android.
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
    console.log("✅ Dados arremessados para a planilha clínica.");
  } catch (error) {
    console.error("❌ Erro ao enviar dados para Sheets:", error);
  }
};
