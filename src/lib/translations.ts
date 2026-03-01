
export type Language = 'pt' | 'en' | 'es';

export const translations = {
  pt: {
    common: {
      play: 'Brincar',
      gallery: 'Galeria',
      profile: 'Perfil',
      shop: 'Loja',
      back: 'Voltar',
      next: 'Próximo',
      finish: 'Finalizar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      settings: 'Configurações',
      skip: 'Pular',
      accessibility: 'Acessibilidade',
      readPage: 'Ler Página',
      libras: 'Assistente de Libras',
      stopAudio: 'Parar Áudio',
      howToPlay: 'Como Brincar',
      safety: 'Segurança e Adaptação',
      close: 'Fechar'
    },
    home: {
      tagline: 'O Mestre do Movimento - Psicomotricidade 2026',
      startJourney: 'Explorar Agora',
      exploreTech: 'Ver Laboratórios',
      connectIdentity: 'Conectar Identidade',
    },
    auth: {
      title: 'UrbeLudo',
      subtitle: 'Mestre da Aura Psicomotora',
      tagline: 'Movimento e Concentração',
      termsAccept: 'Aceito transformar meus movimentos em equilíbrio consciente.',
      loginButton: 'Entrar no Treino',
      signUpButton: 'Criar Identidade',
      googleSignIn: 'Conectar via Google',
      guestSignIn: 'Brincar Agora',
      toggleLogin: 'Já tem conta? Entrar',
      toggleSignUp: 'Novo aqui? Cadastre-se',
      edgeAi: 'Sensores de Borda: Processamento local',
      nameLabel: 'Nome do Explorador',
    },
    playground: {
      selectGame: 'Escolha seu Desafio',
      winTitle: 'Maestria Alcançada!',
      collectCoins: 'Coletar LudoCoins',
      modes: {
        balance: {
          title: 'Equilibrista de Auras',
          goal: 'Estabilidade Biomecânica',
          info: 'Mova o celular com carinho para manter a bolha de luz dentro do círculo! É como carregar uma colher com um ovo sem deixar cair.',
          warning: 'Fique em um lugar plano e seguro. Peça ajuda a um adulto se for subir em algo!',
        },
        rhythm: {
          title: 'Maestro de Fluxo',
          goal: 'Coordenação Rítmica',
          info: 'Ouça o som da aura e balance o celular no ritmo da música! Quando a tela brilhar, é sua hora de tocar seu instrumento mágico.',
          warning: 'Cuidado para não soltar o celular durante os movimentos rápidos!',
          tooEarly: 'Calma, Mestre! No ritmo...',
          dontShake: 'Movimento Suave, por favor!'
        },
        path: {
          title: 'Caminho de Luz',
          goal: 'Precisão Visomotora',
          info: 'Use seu dedo para seguir as trilhas de luz na tela. Tente não sair do caminho para ganhar mais pontos!',
          warning: 'Mantenha os olhos na tela com atenção.',
        },
        breath: {
          title: 'Nuvem de Sopro',
          goal: 'Controle Respiratório',
          info: 'Sopre suavemente no microfone para girar o moinho de vento e criar uma névoa mágica.',
          warning: 'Não precisa soprar muito forte, a aura é sensível!',
        },
        voice: {
          title: 'Elevador de Voz',
          goal: 'Controle Vocal',
          info: 'Cante ou faça um som contínuo para manter o elevador subindo! Se o som parar, o elevador desce.',
          warning: 'Cuidado para não forçar as cordas vocais.',
        }
      }
    },
    dashboard: {
      evolution: 'Sua Aura está evoluindo...',
    },
    tutorial: {
      step1: 'Bem-vindo, {name}! Você é o Mestre do Movimento!',
      step2: 'Use o equilíbrio ou o ritmo para evoluir sua Aura Digital!',
      step3: 'O som vai te guiar para o caminho certo.',
      step4: 'Conclua os desafios para ganhar LudoCoins!',
      gotIt: 'Vamos Brincar!',
    }
  },
  en: {
    common: {
      play: 'Play',
      gallery: 'Gallery',
      profile: 'Profile',
      shop: 'Shop',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      settings: 'Settings',
      skip: 'Skip',
      accessibility: 'Accessibility',
      readPage: 'Read Page',
      libras: 'Sign Language Assist',
      stopAudio: 'Stop Audio',
      howToPlay: 'How to Play',
      safety: 'Safety & Adaptation',
      close: 'Close'
    },
    home: {
      tagline: 'Movement Master - Psychomotricity 2026',
      startJourney: 'Explore Now',
      exploreTech: 'View Labs',
      connectIdentity: 'Connect Identity',
    },
    playground: {
      selectGame: 'Choose your Challenge',
      winTitle: 'Mastery Achieved!',
      collectCoins: 'Collect LudoCoins',
      modes: {
        balance: {
          title: 'Aura Balancer',
          goal: 'Biomechanical Stability',
          info: 'Gently tilt your phone to keep the bubble inside the ring!',
        },
        rhythm: {
          title: 'Flow Maestro',
          goal: 'Rhythmic Coordination',
          info: 'Move to the beat of the music!',
        }
      }
    }
  },
  es: {
    common: {
      play: 'Jugar',
      gallery: 'Galería',
      profile: 'Perfil',
      shop: 'Tienda',
      back: 'Volver',
      next: 'Siguiente',
      finish: 'Finalizar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      settings: 'Ajustes',
      skip: 'Saltar',
      accessibility: 'Accesibilidad',
      readPage: 'Leer Página',
      libras: 'Asistente de Lengua de Señas',
      stopAudio: 'Detener Audio',
      howToPlay: 'Cómo Jugar',
      safety: 'Seguridad y Adaptación',
      close: 'Cerrar'
    },
    home: {
      tagline: 'Maestro del Movimiento - Psicomotricidad 2026',
      startJourney: 'Explorar Agora',
      exploreTech: 'Ver Laboratorios',
      connectIdentity: 'Conectar Identidad',
    }
  }
};
