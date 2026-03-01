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
          goal: 'Sistema Vestibular e Tônus Muscular'
        },
        rhythm: {
          title: 'Maestro de Auras',
          desc: 'Balance o celular no ritmo da batuta mágica.',
          goal: 'Ritmo e Freio Inibitório'
        },
        path: {
          title: 'Caminho de Luz',
          desc: 'Guie a Aura pelo labirinto sem tirar o dedo.',
          goal: 'Coordenação Visomotora e Escrita'
        },
        jump: {
          title: 'O Pulo do Gigante',
          desc: 'Dê o maior pulo para decolar sua Aura!',
          goal: 'Motricidade Global e Impulsão'
        },
        twister: {
          title: 'Twister de Auras',
          desc: 'Segure todos os pontos na tela ao mesmo tempo.',
          goal: 'Dissociação Digital e Lateralidade'
        },
        radar: {
          title: 'O Radar Cego',
          desc: 'Siga o som para encontrar a Aura escondida.',
          goal: 'Percepção Espacial e Auditiva'
        },
        breath: {
          title: 'O Sopro Mágico',
          desc: 'Sopre no microfone para girar o cata-vento!',
          goal: 'Controle Respiratório e Fonoaudiologia'
        },
        voice: {
          title: 'O Elevador de Voz',
          desc: 'Controle o elevador com o volume da sua voz.',
          goal: 'Intensidade e Sustentação Vocal'
        },
        pitch: {
          title: 'Montanha Russa Sonora',
          desc: 'Sons agudos sobem, sons graves descem!',
          goal: 'Modulação de Frequência Vocal'
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
  }
};
