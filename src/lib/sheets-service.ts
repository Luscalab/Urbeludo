/**
 * @fileOverview Serviço de Sincronização com Google Sheets via Apps Script.
 * Permite o acompanhamento clínico remoto dos exercícios de psicomotricidade.
 */

export const sincronizarComPlanilha = async (dados: any) => {
  const url = process.env.NEXT_PUBLIC_SHEETS_API_URL;

  if (!url) {
    console.warn("Sheets: URL da API não configurada no ambiente.");
    return;
  }

  try {
    // Usamos 'no-cors' para compatibilidade máxima com Capacitor/Android WebView
    // O Google Apps Script aceita o POST, mas não retorna cabeçalhos CORS permitindo leitura da resposta.
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(dados),
    });
    console.log("✅ Sincronização Ludo-Sheets concluída com sucesso.");
  } catch (error) {
    console.error("❌ Falha na sincronização Ludo-Sheets:", error);
  }
};
