# UrbeLudo - Playground Urbano Digital 2026

O **UrbeLudo** é um ecossistema móvel de psicomotricidade que utiliza Inteligência Artificial e Realidade Aumentada Lúdica para transformar ambientes comuns em espaços de exploração e movimento seguro.

## 🚀 Arquitetura Técnica

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Plataforma Mobile**: [Capacitor.js](https://capacitorjs.com/) (Build Nativo Android)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting)
- **IA Generativa**: [Genkit](https://firebase.google.com/docs/genkit) + [Gemini 2.0 Flash](https://deepmind.google/technologies/gemini/)

## 🛠️ Stack de Bibliotecas

### UI & Animação
- **Tailwind CSS**: Estilização atômica e responsiva.
- **Framer Motion**: Animações fluidas e micro-interações de 60fps.
- **Shadcn/UI**: Componentes de interface baseados em Radix UI.
- **Lucide React**: Ícones consistentes e modernos.

### Inteligência & Dados
- **Firebase SDK v11**: Sincronização em tempo real e autenticação.
- **Genkit Google AI**: Orquestração de prompts pedagógicos para psicomotricidade.
- **Canvas API**: Processamento de imagem leve para a mecânica de "Rastros de Tinta".

## 🧩 Funcionalidades Principais

1. **Playground Inteligente**:
   - **Rastros de Tinta**: Desenho digital gerado pelo movimento corporal.
   - **Eco Urbano**: Feedback sonoro e rítmico que reage às ações do usuário.
   - **IA Urbano**: Identificação de elementos arquitetônicos seguros para desafios.

2. **Segurança em Camadas**:
   - Priorização de missões "Micro-Urbanismo" (dentro de casa).
   - Curadoria de espaços públicos seguros.
   - IA de borda que descarta biometria facial localmente.

3. **Gamificação (LudoStudio)**:
   - **LudoCoins**: Moeda virtual ganha através de atividade física.
   - **LudoShop**: Loja de itens cosméticos e customização de aura.
   - **Níveis de Studio**: Evolução baseada na expansão da consciência corporal.

4. **Inclusão & Acessibilidade**:
   - Interface multi-idioma (PT-BR, EN, ES).
   - Suporte para Áudio/Voz e Libras.
   - Design mobile-first otimizado para uso com uma mão.

## 📱 Como Rodar o APK (Resumo)

1. `npm install`
2. `npm run static-export` (Gera a pasta /out)
3. `npx cap sync` (Sincroniza com Android)
4. `npx cap open android` (Abre no Android Studio para gerar o .apk)

---
© 2026 UrbeLudo - Psicomotricidade em Movimento.