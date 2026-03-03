"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface BioScanScreenProps {
  onComplete: () => void
  volume: number
  isListening: boolean
  onStartCalibration: () => void
  onFinishCalibration: () => void
}

export function BioScanScreen({
  onComplete,
  volume,
  isListening,
  onStartCalibration,
  onFinishCalibration,
}: BioScanScreenProps) {
  const [phase, setPhase] = useState<"intro" | "scanning" | "done">("intro")
  const [scanProgress, setScanProgress] = useState(0)
  const [peakDetected, setPeakDetected] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startScan = () => {
    setPhase("scanning")
    setScanProgress(0)
    setPeakDetected(0)
    onStartCalibration()

    progressRef.current = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          if (progressRef.current) clearInterval(progressRef.current)
          return 100
        }
        return prev + 2.5
      })
    }, 75)

    timerRef.current = setTimeout(() => {
      setPhase("done")
      onFinishCalibration()
    }, 3000)
  }

  useEffect(() => {
    if (phase === "scanning" && volume > peakDetected) {
      setPeakDetected(volume)
    }
  }, [phase, volume, peakDetected])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [])

  const handleContinue = () => {
    onComplete()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{
        background: "radial-gradient(ellipse at 50% 35%, oklch(0.18 0.10 290 / 0.98), oklch(0.08 0.03 285))",
      }}
    >
      {/* Scan lines decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${15 + i * 14}%`,
              background: "linear-gradient(90deg, transparent, oklch(0.78 0.18 195 / 0.06), transparent)",
            }}
          />
        ))}
      </div>

      {/* Aura avatar */}
      <div
        className="relative w-24 h-24 mb-5"
        style={{
          filter: phase === "scanning"
            ? `drop-shadow(0 0 ${15 + volume * 25}px oklch(0.78 0.18 195 / ${0.3 + volume * 0.5}))`
            : "drop-shadow(0 0 12px oklch(0.50 0.25 295 / 0.3))",
          transition: "filter 0.12s ease",
        }}
      >
        <Image
          src="/assets/elevador/spreedsheet.png"
          alt="Aura"
          fill
          className={`object-contain ${phase === "intro" ? "animate-float-gentle" : ""}`}
          priority
        />
      </div>

      {/* Title */}
      <h2
        className="text-2xl font-bold text-foreground mb-1 text-center"
        style={{ textShadow: "0 0 20px oklch(0.78 0.18 195 / 0.2)" }}
      >
        {phase === "intro" && "Bio-Scan"}
        {phase === "scanning" && "Analisando..."}
        {phase === "done" && "Calibracao Completa!"}
      </h2>

      <p className="text-sm text-muted-foreground mb-8 text-center max-w-[280px] leading-relaxed">
        {phase === "intro" && "Vamos calibrar o microfone com base no seu sopro. Toque em iniciar e sopre durante 3 segundos."}
        {phase === "scanning" && "Sopre no microfone agora! O Aura esta medindo a forca do seu sopro."}
        {phase === "done" && "Perfeito! O sensor esta calibrado para voce. Vamos comecar!"}
      </p>

      {/* Scan visualization */}
      {phase === "scanning" && (
        <div className="w-full max-w-[280px] mb-8">
          {/* Progress bar */}
          <div
            className="relative h-2 rounded-full overflow-hidden mb-3"
            style={{
              background: "oklch(0.20 0.06 280)",
              border: "1px solid oklch(0.30 0.08 280)",
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-100"
              style={{
                width: `${scanProgress}%`,
                background: "linear-gradient(90deg, oklch(0.78 0.18 195), oklch(0.50 0.25 295))",
                boxShadow: "0 0 8px oklch(0.78 0.18 195 / 0.4)",
              }}
            />
          </div>

          {/* Volume bars visualization */}
          <div className="flex items-end justify-center gap-[3px] h-12">
            {Array.from({ length: 20 }).map((_, i) => {
              const barLevel = Math.random() * volume
              const isActive = barLevel > 0.05
              return (
                <div
                  key={i}
                  className="w-2 rounded-full transition-all duration-75"
                  style={{
                    height: `${8 + barLevel * 80}%`,
                    background: isActive
                      ? `linear-gradient(180deg, oklch(0.78 0.18 195 / ${0.5 + barLevel}), oklch(0.50 0.25 295 / ${0.3 + barLevel * 0.5}))`
                      : "oklch(0.22 0.06 280)",
                    boxShadow: isActive ? `0 0 4px oklch(0.78 0.18 195 / ${barLevel * 0.5})` : "none",
                  }}
                />
              )
            })}
          </div>

          {/* Peak display */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Pico detectado:</span>
            <span className="text-sm font-bold font-mono text-cyber-cyan tabular-nums">
              {(peakDetected * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Done state */}
      {phase === "done" && (
        <div className="flex items-center gap-4 mb-8">
          <div
            className="px-4 py-2 rounded-lg"
            style={{
              background: "oklch(0.78 0.18 195 / 0.1)",
              border: "1px solid oklch(0.78 0.18 195 / 0.2)",
            }}
          >
            <span className="text-[10px] text-cyber-cyan/70 uppercase tracking-wider block mb-0.5">Sensibilidade</span>
            <span className="text-lg font-bold text-cyber-cyan font-mono tabular-nums">
              {(peakDetected * 100).toFixed(0)}%
            </span>
          </div>
          <div
            className="px-4 py-2 rounded-lg"
            style={{
              background: "oklch(0.82 0.18 85 / 0.1)",
              border: "1px solid oklch(0.82 0.18 85 / 0.2)",
            }}
          >
            <span className="text-[10px] text-cyber-gold/70 uppercase tracking-wider block mb-0.5">Status</span>
            <span className="text-lg font-bold text-cyber-gold">Pronto</span>
          </div>
        </div>
      )}

      {/* Action button */}
      {phase === "intro" && isListening && (
        <button
          onClick={startScan}
          className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base active:scale-95 transition-all"
          style={{
            background: "linear-gradient(135deg, oklch(0.50 0.25 295), oklch(0.40 0.20 300))",
            color: "oklch(0.95 0.02 200)",
            boxShadow: "0 0 25px oklch(0.50 0.25 295 / 0.35)",
            border: "1px solid oklch(0.50 0.25 295 / 0.5)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Iniciar Bio-Scan
        </button>
      )}

      {phase === "done" && (
        <button
          onClick={handleContinue}
          className="flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-base active:scale-95 transition-all"
          style={{
            background: "linear-gradient(135deg, oklch(0.78 0.18 195), oklch(0.60 0.20 210))",
            color: "oklch(0.10 0.04 285)",
            boxShadow: "0 0 25px oklch(0.78 0.18 195 / 0.35)",
            border: "1px solid oklch(0.78 0.18 195 / 0.5)",
          }}
        >
          Comecar o Jogo
        </button>
      )}
    </div>
  )
}
