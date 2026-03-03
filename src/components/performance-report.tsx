"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import type { SessionStats } from "@/hooks/use-microphone"

interface PerformanceReportProps {
  stats: SessionStats
  totalCoins: number
  maxFloor: number
  maxLevel: number
  isVisible: boolean
  onClose: () => void
}

export function PerformanceReport({
  stats,
  totalCoins,
  maxFloor,
  maxLevel,
  isVisible,
  onClose,
}: PerformanceReportProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => setShowContent(true), 200)
      return () => clearTimeout(t)
    }
    setShowContent(false)
  }, [isVisible])

  if (!isVisible) return null

  const constancy = Math.min(stats.avgConsistency * 100, 100)
  const peak = Math.min(stats.peakIntensity * 100, 100)
  const sustain = stats.sustainTime
  const totalBlow = stats.totalBlowTime
  const sessionMin = Math.floor(stats.sessionDuration / 60)
  const sessionSec = Math.floor(stats.sessionDuration % 60)

  const getGrade = () => {
    const score = constancy * 0.3 + peak * 0.2 + Math.min(sustain * 10, 30) + Math.min(maxFloor, 20)
    if (score >= 60) return { label: "Excelente", color: "oklch(0.82 0.18 85)" }
    if (score >= 40) return { label: "Muito Bom", color: "oklch(0.78 0.18 195)" }
    if (score >= 20) return { label: "Bom", color: "oklch(0.60 0.20 300)" }
    return { label: "Iniciante", color: "oklch(0.65 0.06 260)" }
  }

  const grade = getGrade()

  const metrics = [
    {
      label: "Constancia Respiratoria",
      value: `${constancy.toFixed(0)}%`,
      bar: constancy,
      color: "oklch(0.78 0.18 195)",
      desc: "Regularidade do sopro durante a sessao",
    },
    {
      label: "Pico de Intensidade",
      value: `${peak.toFixed(0)}%`,
      bar: peak,
      color: "oklch(0.50 0.25 295)",
      desc: "Forca maxima atingida no sopro",
    },
    {
      label: "Tempo de Sustentacao",
      value: `${sustain.toFixed(1)}s`,
      bar: Math.min((sustain / 8) * 100, 100),
      color: "oklch(0.82 0.18 85)",
      desc: "Maior duracao continua de sopro",
    },
    {
      label: "Tempo Total de Sopro",
      value: `${totalBlow.toFixed(1)}s`,
      bar: Math.min((totalBlow / 30) * 100, 100),
      color: "oklch(0.70 0.20 310)",
      desc: "Tempo acumulado soprando",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, oklch(0.15 0.10 290 / 0.97), oklch(0.06 0.03 285 / 0.99))",
          backdropFilter: "blur(16px)",
        }}
      />

      {showContent && (
        <div
          className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-2xl animate-level-enter"
          style={{
            background: "linear-gradient(180deg, oklch(0.18 0.08 285), oklch(0.12 0.04 285))",
            border: "1px solid oklch(0.50 0.25 295 / 0.25)",
            boxShadow: "0 0 50px oklch(0.50 0.25 295 / 0.15), 0 0 100px oklch(0.78 0.18 195 / 0.08)",
          }}
        >
          {/* Top glow bar */}
          <div
            className="h-1 animate-shimmer shrink-0"
            style={{
              backgroundImage: "linear-gradient(90deg, transparent, oklch(0.78 0.18 195), oklch(0.82 0.18 85), oklch(0.50 0.25 295), transparent)",
              backgroundSize: "200% 100%",
            }}
          />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src="/assets/elevador/spreedsheet.png"
                  alt="Aura"
                  width={32}
                  height={32}
                  className="object-contain animate-float-gentle"
                  unoptimized
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Relatorio de Desempenho</h2>
                <p className="text-[10px] text-cyber-cyan/70 uppercase tracking-wider font-semibold">
                  Coord. Pneumofonoarticulatoria
                </p>
              </div>
            </div>

            {/* Session summary */}
            <div
              className="grid grid-cols-3 gap-2 mb-5"
            >
              {[
                { label: "Sessao", value: `${sessionMin}:${sessionSec.toString().padStart(2, "0")}`, color: "oklch(0.78 0.18 195)" },
                { label: "Andares", value: `${maxFloor}`, color: "oklch(0.82 0.18 85)" },
                { label: "Moedas", value: `${totalCoins}`, color: "oklch(0.82 0.18 85)" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center py-2.5 rounded-xl"
                  style={{
                    background: "oklch(0.16 0.06 280 / 0.6)",
                    border: "1px solid oklch(0.30 0.08 280)",
                  }}
                >
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</span>
                  <span className="text-lg font-bold font-mono tabular-nums" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Grade */}
            <div
              className="flex items-center justify-center gap-3 py-3 rounded-xl mb-5"
              style={{
                background: `linear-gradient(135deg, ${grade.color}15, transparent)`,
                border: `1px solid ${grade.color}30`,
              }}
            >
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Avaliacao Geral:</span>
              <span
                className="text-xl font-bold"
                style={{ color: grade.color, textShadow: `0 0 12px ${grade.color}40` }}
              >
                {grade.label}
              </span>
            </div>

            {/* Metrics */}
            <div className="flex flex-col gap-3.5 mb-5">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{m.label}</span>
                    <span className="text-xs font-bold font-mono tabular-nums" style={{ color: m.color }}>{m.value}</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "oklch(0.20 0.06 280)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${m.bar}%`,
                        background: `linear-gradient(90deg, ${m.color}, ${m.color}80)`,
                        boxShadow: `0 0 6px ${m.color}40`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                </div>
              ))}
            </div>

            {/* CPFA explanation */}
            <div
              className="rounded-xl p-3.5 mb-5"
              style={{
                background: "oklch(0.16 0.06 285 / 0.6)",
                border: "1px solid oklch(0.78 0.18 195 / 0.12)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan" />
                <span className="text-[10px] uppercase tracking-wider text-cyber-cyan/70 font-semibold">Ganhos em CPFA</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A Coordenacao Pneumofonoarticulatoria (CPFA) envolve a sincronia entre respiracao, fonacao e articulacao.
                Ao praticar o sopro controlado neste jogo, voce fortalece a musculatura expiratoria,
                melhora o controle da pressao subglotica e desenvolve maior consciencia do fluxo de ar
                {" "}-- habilidades essenciais para a producao vocal saudavel.
              </p>
            </div>

            {/* Aura message */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative w-9 h-9 shrink-0">
                <Image
                  src="/assets/elevador/spreedsheet.png"
                  alt="Aura"
                  width={32}
                  height={32}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {peak > 60
                  ? "Excelente forca de sopro! Sua musculatura expiratoria esta otima."
                  : peak > 30
                    ? "Bom progresso! Continue praticando para aumentar a forca e constancia."
                    : "Voce comecou bem! Pratique diariamente para melhores resultados."}
              </p>
            </div>

            {/* Button */}
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform"
              style={{
                background: "linear-gradient(135deg, oklch(0.78 0.18 195), oklch(0.60 0.20 210))",
                color: "oklch(0.10 0.04 285)",
                boxShadow: "0 0 20px oklch(0.78 0.18 195 / 0.3)",
                border: "1px solid oklch(0.78 0.18 195 / 0.4)",
              }}
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
