/**
 * @fileOverview Respostas Estáticas para o Filtro Semântico de Borda.
 * Garante performance 60FPS no APK sem depender de rede para perguntas comuns.
 */

export interface StaticAuraResponse {
  answer: string;
  suggestedAction?: string;
  keywords: string[];
}

export const STATIC_AURA_RESPONSES: StaticAuraResponse[] = [
  {
    answer: "Para subir o Elevador de Voz, mantenha um som vocal constante e suave. Se estiver difícil, tente a Nuvem de Sopro primeiro!",
    suggestedAction: "Focar na Voz",
    keywords: ["jogar", "como brincar", "elevador", "subir", "não sobe"]
  },
  {
    answer: "LudoCoins são suas recompensas por se movimentar! Use-as na Loja para comprar móveis e decorar seu Estúdio Ludo.",
    suggestedAction: "Ir para Loja",
    keywords: ["moeda", "dinheiro", "ludocoins", "comprar", "preço", "ganhar"]
  },
  {
    answer: "Se o app travar ou o som sumir, verifique se deu permissão de microfone nas configurações do seu celular Android.",
    suggestedAction: "Ver Permissões",
    keywords: ["ajuda", "bug", "travou", "erro", "não funciona", "microfone"]
  },
  {
    answer: "O Mestre da Aura é você! Cada nível que você sobe desbloqueia novas missões e itens especiais para seu avatar.",
    suggestedAction: "Ver Evolução",
    keywords: ["mestre", "nível", "evoluir", "level", "progresso"]
  },
  {
    answer: "A Psicomotricidade no UrbeLudo ajuda você a dominar o equilíbrio, o ritmo e a respiração através da tecnologia consciente.",
    suggestedAction: "Saber Mais",
    keywords: ["psicomotricidade", "corpo", "saúde", "movimento", "exercício"]
  }
];
