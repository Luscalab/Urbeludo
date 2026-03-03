"use client"

import { ArrowUp, MicOff, Coins, Layers, Ruler } from "lucide-react"

interface GameHudProps {
  floor: number
  maxFloor: number
  coins: number
  isListening: boolean
  onStop: () => void
  level: number
}

export function GameHud({ floor, maxFloor, coins, isListening, onStop, level }: GameHudProps) {
  const heightM = (floor * 3.5).toFixed(0)

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto px-3 pt-4">
        {/* Top row: Floor + Height + Coins + Stop */}
        <div className="flex items-start justify-between gap-1.5">
          {/* Floor + Height */}
          <div
            className="rounded-xl px-2.5 py-2 pointer-events-auto"
            style={{
              background: "oklch(0.12 0.04 285 / 0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid oklch(0.78 0.18 195 / 0.15)",
            }}
          >
            <div className="flex items-center gap-2">
              <ArrowUp className="w-3.5 h-3.5 text-primary shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] text-muted-foreground uppercase tracking-wider leading-none">Andar</span>
                <span className="text-base font-bold text-foreground tabular-nums leading-tight font-mono">{floor}</span>
              </div>
              <div className="w-px h-6 bg-border/30" />
              <div className="flex flex-col">
                <span className="text-[8px] text-muted-foreground uppercase tracking-wider leading-none">Altura</span>
                <span className="text-base font-bold text-cyber-cyan tabular-nums leading-tight font-mono">{heightM}m</span>
              </div>
            </div>
          </div>

          {/* Level */}
          {level > 0 && (
            <div
              className="rounded-xl px-2.5 py-2"
              style={{
                background: "oklch(0.12 0.04 285 / 0.85)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid oklch(0.50 0.25 295 / 0.2)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-wider leading-none">Fase</span>
                  <span className="text-base font-bold text-accent tabular-nums leading-tight font-mono">{level}</span>
                </div>
              </div>
            </div>
          )}

          {/* Coins */}
          <div
            className="rounded-xl px-2.5 py-2"
            style={{
              background: "oklch(0.12 0.04 285 / 0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid oklch(0.82 0.18 85 / 0.15)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-cyber-gold shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] text-cyber-gold/50 uppercase tracking-wider leading-none">Moedas</span>
                <span className="text-base font-bold text-cyber-gold tabular-nums leading-tight font-mono">{coins}</span>
              </div>
            </div>
          </div>

          {/* Stop */}
          {isListening && (
            <button
              onClick={onStop}
              className="rounded-xl p-2.5 pointer-events-auto active:scale-95 transition-transform"
              style={{
                background: "oklch(0.12 0.04 285 / 0.85)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid oklch(0.50 0.25 295 / 0.15)",
              }}
              aria-label="Parar e ver relatorio"
            >
              <MicOff className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Record bar */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Ruler className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider font-mono">
            Recorde: {maxFloor}F / {(maxFloor * 3.5).toFixed(0)}m
          </span>
        </div>
      </div>
    </div>
  )
}
