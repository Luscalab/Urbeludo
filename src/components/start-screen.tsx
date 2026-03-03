"use client"

import { Mic } from "lucide-react"
import Image from "next/image"

interface StartScreenProps {
  onStart: () => void
  error: string | null
}

export function StartScreen({ onStart, error }: StartScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center w-full h-screen"
      style={{
        backgroundImage: "url(/assets/elevador/tela%20inical.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for better text visibility */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Aura Logo */}
      <div
        className="relative w-24 h-24 mb-6 animate-bounce"
        style={{
          animationDuration: "2.5s",
          filter: "drop-shadow(0 0 20px oklch(0.78 0.18 195 / 0.4))",
          zIndex: 10,
        }}
      >
        <Image
          src="/assets/elevador/spreedsheet.png"
          alt="Aura, o robo"
          width={32}
          height={32}
          className="object-contain"
          priority
          unoptimized
        />
      </div>

      {/* Title */}
      <h1
        className="text-5xl font-bold tracking-tight mb-1 text-foreground relative z-10"
        style={{
          textShadow: "0 0 30px oklch(0.78 0.18 195 / 0.3), 0 0 60px oklch(0.50 0.25 295 / 0.2)",
        }}
      >
        Elevador
      </h1>
      <p className="text-muted-foreground text-sm mb-10 text-center max-w-[280px] leading-relaxed text-balance relative z-10">
        Sopre no microfone para elevar o Aura pela torre cibernetica infinita!
      </p>

      {/* Start button */}
      <button
        onClick={onStart}
        className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg active:scale-95 transition-all relative z-10"
        style={{
          background: "linear-gradient(135deg, oklch(0.78 0.18 195), oklch(0.60 0.20 210))",
          color: "oklch(0.10 0.04 285)",
          boxShadow: "0 0 30px oklch(0.78 0.18 195 / 0.4), 0 0 60px oklch(0.78 0.18 195 / 0.15)",
          border: "1px solid oklch(0.78 0.18 195 / 0.5)",
        }}
      >
        <Mic className="w-5 h-5" />
        Iniciar Microfone
      </button>

      {/* Error message */}
      {error && (
        <div className="mt-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 max-w-[300px] relative z-10">
          <p className="text-destructive text-xs text-center leading-relaxed">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-10 flex flex-col items-center gap-3 relative z-10">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
          Sopre forte = sobe
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <div className="w-2 h-2 rounded-full bg-cyber-purple" />
          {'Silencio = desce (gravidade)'}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <div className="w-2 h-2 rounded-full bg-cyber-gold animate-pulse" style={{ animationDelay: "0.5s" }} />
          A cada 10 andares = bau com moedas
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "1s" }} />
          Aprenda sobre fonoaudiologia a cada fase
        </div>
      </div>
    </div>
  )
}
