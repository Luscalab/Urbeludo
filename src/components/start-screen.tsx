"use client"

import { Play } from "lucide-react"
import Image from "next/image"

interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center w-full h-screen">
      <Image
        src="/assets/elevador/tela-inicial.png"
        layout="fill"
        objectFit="cover"
        alt="Tela inicial do jogo Elevador com uma torre cibernética ao fundo."
        className="-z-10"
        priority
        unoptimized
      />
      {/* Dark overlay for better text visibility */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "rgba(0, 0, 0, 0.4)",
        }}
      />

      {/* Aura Logo */}
      <div
        className="relative w-32 h-32 mb-8 animate-bounce"
        style={{
          animationDuration: "3s",
          filter: "drop-shadow(0 0 30px oklch(0.78 0.18 195 / 0.5))",
        }}
      >
        <div
          role="img"
          aria-label="Aura, o robo"
          className="w-full h-full"
          style={{
            backgroundImage: "url(/assets/elevador/spritesheet.png)",
            backgroundSize: "800% 100%",
            backgroundPosition: "0 0",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest active:scale-95 transition-all"
        style={{
          background: "linear-gradient(135deg, oklch(0.95 0.05 200), oklch(0.9 0.05 200))",
          color: "oklch(0.20 0.04 285)",
          textShadow: "0 1px 1px oklch(1 0 0 / 0.2)",
          boxShadow:
            "0 0 50px oklch(0.78 0.18 195 / 0.5), 0 0 80px oklch(0.78 0.18 195 / 0.2), inset 0 2px 0 oklch(1 0 0 / 0.1)",
          border: "2px solid oklch(0.8 0.05 200 / 0.8)",
        }}
      >
        <Play className="w-6 h-6" />
        Começar
      </button>

      {/* Instructions */}
      <div className="absolute bottom-8 flex flex-col items-center gap-3 opacity-60">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
          Sopre forte ou segure Espaço = sobe
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <div className="w-2 h-2 rounded-full bg-cyber-purple" />
          {'Silêncio = desce (gravidade)'}
        </div>
      </div>
    </div>
  )
}

