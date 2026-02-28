# UrbeLudo - Playground Urbano Digital 2026

O **UrbeLudo** é um ecossistema móvel de psicomotricidade que utiliza Inteligência Artificial e Realidade Aumentada Lúdica para transformar ambientes comuns em espaços de exploração e movimento seguro.

## 🚀 Arquitetura Técnica

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router) com Turbopack.
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode).
- **IA Generativa**: [Genkit](https://firebase.google.com/docs/genkit) + [Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/).
- **Backend**: [Firebase v11](https://firebase.google.com/) (Auth, Firestore, App Hosting).
- **Mobile**: [Capacitor.js](https://capacitorjs.com/) para build nativo Android.

## 🛠️ Detalhamento de Funções e Lógica de Construção

### 1. Motor de Movimento (PlaygroundInterface.tsx)

Este é o coração do aplicativo. Ele gerencia a visão computacional leve e a lógica de jogo.

*   **`startCamera(mode)`**: 
    *   **Como foi construído**: Utiliza a `MediaDevices API` nativa do navegador.
    *   **Lógica**: Recebe `'user'` ou `'environment'`. Implementa uma limpeza de tracks (`stop()`) antes de iniciar um novo stream para evitar vazamento de memória e conflitos de hardware no Android.
*   **`processFrames()`**:
    *   **Como foi construído**: Implementado dentro de um `useEffect` com `requestAnimationFrame`.
    *   **Lógica**: Captura o frame atual do `<video>` em um `<canvas>` oculto. Compara o `ImageData` do frame atual com o anterior (Frame Differencing). 
    *   **Rastros de Tinta**: Se a diferença de cor em um pixel ultrapassa um threshold, calculamos o centro de massa do movimento e desenhamos um arco no `trailCanvasRef` com a cor da "Aura" do usuário.
*   **`playBeep(freq)`**:
    *   **Como foi construído**: Utiliza a `Web Audio API` (`AudioContext`).
    *   **Lógica**: Cria um oscilador senoidal puro que toca por 100ms. A frequência é mapeada com base na posição X do movimento (esquerda/direita), criando o efeito "Eco Urbano".

### 2. Inteligência Artificial (src/ai/flows/)

Orquestração de prompts pedagógicos via Genkit.

*   **`proposeDynamicChallenges`**:
    *   **Construção**: Um "Genkit Flow" que consome o modelo `gemini-2.0-flash`.
    *   **Lógica**: Recebe o nível psicomotor (1-4) e a categoria (Arte, Motor, Mente, Zen). Ele gera um JSON estruturado com título, descrição e exatamente 3 passos executáveis. Inclui "Golden Safety Rules" no prompt do sistema para garantir que nenhum desafio envolva riscos urbanos.
*   **`identifyUrbanElements`**:
    *   **Construção**: Um fluxo de Visão Computacional Genkit.
    *   **Lógica**: Recebe uma DataURI da câmera. O Gemini analisa a imagem e identifica "linhas", "degraus" ou "muros", retornando suas coordenadas textuais para que o mestre de desafios possa sugerir algo específico para aquele cenário.

### 3. Persistência e Sincronização (src/firebase/)

Gerenciamento de dados resiliente e não-bloqueante.

*   **`updateDocumentNonBlocking`**:
    *   **Construção**: Wrapper customizado sobre o `updateDoc` do Firebase.
    *   **Lógica**: Inicia a escrita no Firestore sem o uso de `await`. Se houver erro de permissão (Security Rules), ele emite um evento global via `errorEmitter`. Isso permite uma interface extremamente fluida (Optimistic UI) onde o usuário nunca espera o "loading" para ganhar moedas.
*   **`AuthInitializer`**:
    *   **Construção**: Componente de alta ordem (HOC) no `layout.tsx`.
    *   **Lógica**: Verifica se o usuário já existe. Se não, cria automaticamente um perfil anônimo e inicializa o documento `UserProgress` com valores padrão (nível 1, 50 moedas, itens básicos), garantindo que o app esteja pronto para uso imediato.

### 4. Internacionalização (src/components/I18nProvider.tsx)

Sistema de tradução sem dependências pesadas.

*   **`t(path)`**:
    *   **Construção**: Context Provider React.
    *   **Lógica**: Navega por um objeto JSON de traduções usando recursividade simples (`path.split('.')`). Implementa um fallback automático para Português (BR) caso uma chave esteja faltando no Inglês ou Espanhol, garantindo que o usuário nunca veja um erro de tradução.

## 📱 Como Rodar o APK (Resumo)

1. `npm install`
2. `npm run static-export` (Gera a pasta /out)
3. `npx cap sync` (Sincroniza com Android)
4. `npx cap open android` (Abre no Android Studio para gerar o .apk)

---
© 2026 UrbeLudo - Psicomotricidade em Movimento.
