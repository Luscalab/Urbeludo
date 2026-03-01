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
      heroTitle: 'Seu corpo é o equilíbrio',
      heroSubtitle: 'Use os sensores do seu celular para dominar sua Aura Digital. O Playground de precisão de 2026 no seu bolso.',
      tagline: 'O Mestre das Auras - Ritmo e Equilíbrio',
      startJourney: 'Entrar no Desafio',
      exploreTech: 'Ver Ciência',
      activePlayers: 'Artistas Ativos',
      coreEngine: 'Motor Vestibular',
      whyUrbeLudo: 'O que é o Mestre da Aura?',
      privacyTitle: 'Privacidade Total',
      privacyDesc: 'Sensores 100% locais. Nenhuma imagem ou som é enviado para a rede.',
      psychomotorTitle: 'Corpo e Mente',
      psychomotorDesc: 'Estimula o sistema vestibular, propriocepção e coordenação fina.',
      aiTitle: 'Sinfonia de Orientação',
      aiDesc: 'O som reage a cada milímetro do seu movimento.',
      mobileTitle: 'Offline e Seguro',
      mobileDesc: 'Funciona em qualquer lugar, sem câmera ou internet.',
      ctaTitle: 'A gravidade é seu playground.',
      ctaDesc: 'Domine seus movimentos e conquiste a estabilidade.',
      connectIdentity: 'Criar Perfil',
      offlineSeal: 'Soberania de Dados: Processamento 100% Local',
    },
    auth: {
      title: 'UrbeLudo',
      subtitle: 'Mestre da Aura Digital',
      tagline: 'Movimento e Concentração',
      emailLabel: 'E-mail do Responsável',
      passwordLabel: 'Senha Segura',
      termsAccept: 'Aceito transformar meus movimentos em equilíbrio digital seguro.',
      loginButton: 'Entrar no Desafio',
      signUpButton: 'Criar Identidade',
      googleSignIn: 'Conectar via Google',
      guestSignIn: 'Brincar Agora',
      toggleLogin: 'Já tem conta? Entrar',
      toggleSignUp: 'Novo aqui? Cadastre-se',
      edgeAi: 'Sensores Locais: Processamento em tempo real no hardware',
      nameLabel: 'Nome do Herói',
      termsTitle: 'Compromisso de Ludicidade',
      privacyWarning: 'Voz e Movimento NUNCA saem deste aparelho.',
    },
    playground: {
      selectGame: 'Escolha seu Desafio',
      workingOn: 'Trabalhando:',
      startChallenge: 'Iniciar Agora',
      winTitle: 'Desafio Concluído!',
      collectCoins: 'Coletar Moedas',
      modes: {
        balance: {
          title: 'Equilibrista de Auras',
          desc: 'Mantenha a esfera no centro usando a gravidade.',
          goal: 'Sistema Vestibular e Tônus Muscular',
          info: 'Trabalha o equilíbrio estático e dinâmico.',
          warning: 'Este jogo exige controle do tronco e mãos estáveis.',
          tip: 'Se o equilíbrio for difícil, tente jogar sentado em uma superfície firme.'
        },
        rhythm: {
          title: 'Maestro de Auras',
          desc: 'Balance o celular no ritmo da batuta mágica.',
          goal: 'Ritmo e Freio Inibitório',
          tooEarly: 'Muito Cedo!',
          dontShake: 'Não balance!',
          offBeat: 'Fora de Ritmo!',
          info: 'Trabalha a coordenação rítmica e o freio inibitório.',
          warning: 'Se o tempo da música for um desafio, tente focar apenas no som e relaxar os braços primeiro.',
          tip: 'Você pode jogar batendo o celular suavemente na palma da outra mão.'
        },
        path: {
          title: 'Caminho de Luz',
          desc: 'Guie a Aura pelo labirinto sem tirar o dedo.',
          goal: 'Coordenação Visomotora e Escrita',
          info: 'Desenvolve a coordenação olho-mão e precisão digital.',
          warning: 'Este desafio exige paciência. Errar o caminho faz parte do treino! Respire fundo e recomece devagar.',
          tip: 'Para quem tem dificuldade motora fina, use uma caneta touch para maior controle.'
        },
        jump: {
          title: 'O Pulo do Gigante',
          desc: 'Dê o maior pulo para decolar sua Aura!',
          goal: 'Motricidade Global e Impulsão',
          info: 'Recruta grandes grupos musculares e força de explosão.',
          warning: 'Atenção: Envolve movimentos bruscos. Crianças com hipersensibilidade vestibular podem precisar de apoio.',
          tip: 'O pulo pode ser substituído por um movimento rápido de braços para cima.'
        },
        radar: {
          title: 'O Radar Cego',
          desc: 'Siga o som para encontrar a Aura escondida.',
          goal: 'Percepção Espacial e Auditiva',
          info: 'Trabalha a localização sonora e orientação 360 graus.',
          warning: 'Sons 3D podem causar desorientação. Se sentir tontura, jogue com o volume baixo.',
          tip: 'Tente jogar de olhos fechados para focar totalmente na audição.'
        },
        breath: {
          title: 'O Sopro Mágico',
          desc: 'Sopre no microfone para girar o cata-vento!',
          goal: 'Controle Respiratório e Fonoaudiologia',
          info: 'Treino de fluxo aéreo e capacidade vital pulmonar.',
          warning: 'Exige esforço respiratório. Se sentir tontura, faça uma pausa e recupere o fôlego.',
          tip: 'Pode ser controlado por sopros curtos (staccato) se o sopro longo for difícil.'
        },
        voice: {
          title: 'O Elevador de Voz',
          desc: 'Controle o elevador com o volume da sua voz.',
          goal: 'Intensidade e Sustentação Vocal',
          info: 'Controle de volume (dB) e sustentação de vogais.',
          warning: 'Trabalha a propriocepção vocal. Evite gritar excessivamente.',
          tip: 'Use sons suaves como "hummm" ou "shhh" para um controle mais estável.'
        },
        pitch: {
          title: 'Montanha Russa Sonora',
          desc: 'Sons agudos sobem, sons graves descem!',
          goal: 'Modulação de Frequência Vocal',
          info: 'Alongamento e encurtamento das pregas vocais.',
          warning: 'Explore as frequências sem forçar a garganta.',
          tip: 'Imagine que você é um passarinho para subir e um urso para descer!'
        }
      }
    },
    dashboard: {
      auraPower: 'Poder da Aura',
      evolution: 'Sua Aura está evoluindo...',
    },
    tutorial: {
      step1: 'Bem-vindo, {name}! Segure o celular com as duas mãos. Você é o Mestre da Aura!',
      step2: 'Use o equilíbrio ou o ritmo para evoluir sua Aura Digital!',
      step3: 'O som vai te guiar. Quando estiver afinado, você está no caminho certo.',
      step4: 'Conclua os desafios para ganhar LudoCoins e subir de nível!',
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
    playground: {
      selectGame: 'Choose your Challenge',
      modes: {
        rhythm: {
          tooEarly: 'Too Early!',
          dontShake: "Don't Shake!",
          offBeat: 'Off Beat!'
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
    playground: {
      selectGame: 'Elige tu Desafío',
      modes: {
        rhythm: {
          tooEarly: '¡Muy Pronto!',
          dontShake: '¡No agites!',
          offBeat: '¡Fuera de Ritmo!'
        }
      }
    }
  }
};