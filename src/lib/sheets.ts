/**
 * @fileOverview Serviço de Sincronização com Google Sheets - 100% Client-Side.
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
 */
export const saveToSheets = async (data: SheetsPayload) => {
  const url = process.env.NEXT_PUBLIC_SHEETS_API_URL;

  if (!url) {
    console.error("Sheets: URL da API não configurada no .env.local (NEXT_PUBLIC_SHEETS_API_URL)");
    return;
  }

  try {
    // mode: 'no-cors' é vital para o Capacitor ignorar cabeçalhos de resposta que o Google Apps Script não envia
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
