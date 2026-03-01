
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
      stopAudio: 'Parar Áudio'
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
    },
    playground: {
      selectGame: 'Escolha seu Desafio',
      waitingStart: 'Inicie o Desafio',
      centering: 'Centralizando...',
      stabilizing: 'Estabilizando Aura',
      winTitle: 'Desafio Concluído!',
      collectCoins: 'Coletar Moedas',
      modes: {
        balance: {
          title: 'Equilibrista de Auras',
          desc: 'Mantenha a esfera no centro usando a gravidade.'
        },
        rhythm: {
          title: 'Maestro de Auras',
          desc: 'Balance o celular no ritmo da batuta mágica.'
        },
        path: {
          title: 'Caminho de Luz',
          desc: 'Guie a Aura pelo labirinto sem tirar o dedo.'
        }
      }
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
      libras: 'Sign Language',
      stopAudio: 'Stop Audio'
    },
    home: {
      heroTitle: 'Your body is the balance',
      heroSubtitle: 'Use your phone\'s sensors to master your Digital Aura. The 2026 precision playground in your pocket.',
      tagline: 'Aura Master - Rhythm and Balance',
      startJourney: 'Enter Challenge',
      exploreTech: 'See Science',
      activePlayers: 'Active Players',
      coreEngine: 'Vestibular Engine',
      whyUrbeLudo: 'What is Aura Master?',
      privacyTitle: 'Total Privacy',
      privacyDesc: '100% local sensors. No images or sounds are sent online.',
      psychomotorTitle: 'Body and Mind',
      psychomotorDesc: 'Stimulates vestibular system, proprioception, and fine motor skills.',
      aiTitle: 'Orientation Symphony',
      aiDesc: 'Sound reacts to every millimeter of your movement.',
      mobileTitle: 'Offline and Safe',
      mobileDesc: 'Works anywhere, no camera or internet needed.',
      ctaTitle: 'Gravity is your playground.',
      ctaDesc: 'Master your movements and conquer stability.',
      connectIdentity: 'Create Profile',
    },
    playground: {
      selectGame: 'Choose your Challenge',
      waitingStart: 'Start Challenge',
      winTitle: 'Challenge Complete!',
      collectCoins: 'Collect Coins',
      modes: {
        balance: {
          title: 'Aura Balancer',
          desc: 'Keep the sphere centered using gravity.'
        },
        rhythm: {
          title: 'Aura Maestro',
          desc: 'Shake the phone to the rhythm of the magic baton.'
        },
        path: {
          title: 'Path of Light',
          desc: 'Guide the Aura through the maze without lifting your finger.'
        }
      }
    }
  }
};
