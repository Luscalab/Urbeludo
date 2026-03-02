/**
 * @fileOverview Dicionário de Borda (Respostas Estáticas).
 * Garante performance 60FPS no APK para perguntas comuns.
 */

export interface StaticAuraResponse {
  answer: string;
  suggestedAction?: string;
  keywords: string[];
}

export const STATIC_AURA_RESPONSES: StaticAuraResponse[] = [
  {
    answer: "Para subir o Elevador de Voz, mantenha sua voz constante na zona verde. Se estiver difícil, que tal treinar sua respiração na Nuvem de Sopro?",
    suggestedAction: "Ir para Sopro",
    keywords: ["jogar", "como brincar", "elevador", "subir", "não sobe", "instruções"]
  },
  {
    answer: "LudoCoins são moedas mágicas que você ganha ao treinar! Use-as na Loja para comprar móveis incríveis e decorar seu Estúdio Ludo.",
    suggestedAction: "Ir para Loja",
    keywords: ["moeda", "dinheiro", "ludocoins", "comprar", "preço", "ganhar", "coins"]
  },
  {
    answer: "Se o app travar ou o microfone não funcionar, verifique se deu permissão de áudio nas configurações do seu celular Android.",
    suggestedAction: "Ajuda Técnica",
    keywords: ["ajuda", "bug", "travou", "erro", "não funciona", "microfone", "permissão"]
  },
  {
    answer: "O Mestre da Aura é o seu guia de evolução! Conclua missões para subir de nível e desbloquear novos itens para o seu avatar.",
    suggestedAction: "Ver Perfil",
    keywords: ["mestre", "nível", "evoluir", "level", "progresso", "quem é"]
  },
  {
    answer: "A Psicomotricidade estuda a relação entre o seu pensamento e o seu movimento. No UrbeLudo, usamos tecnologia para tornar isso divertido!",
    suggestedAction: "Sobre o App",
    keywords: ["psicomotricidade", "corpo", "saúde", "movimento", "estudo", "conceito"]
  }
];
