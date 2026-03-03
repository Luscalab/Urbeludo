"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface LevelCompleteModalProps {
  level: number
  coins: number
  isVisible: boolean
  onContinue: () => void
}

// Pedagogical gains based on speech therapy / phonoaudiology
const PEDAGOGICAL_DATA: Record<number, { title: string; description: string; skill: string; icon: string }> = {
  1: {
    title: "Controle de Fluxo de Ar",
    description: "Voce praticou o controle basico da corrente de ar expiratoria. Essa habilidade e essencial na fonoaudiologia para fortalecer a musculatura orofacial e melhorar a coordenacao respiratoria.",
    skill: "Respiracao Diafragmatica",
    icon: "wind",
  },
  2: {
    title: "Forca Respiratoria",
    description: "Ao soprar com mais intensidade, voce trabalhou a pressao subglotica, fundamental para a producao vocal. Pacientes com disfonia se beneficiam desse exercicio para regular a forca do sopro.",
    skill: "Pressao Subglotica",
    icon: "lungs",
  },
  3: {
    title: "Sustentacao do Sopro",
    description: "Manter o sopro constante por mais tempo treina a capacidade vital e a resistencia da musculatura expiratoria. Esse exercicio e usado em terapia para pacientes com disartria.",
    skill: "Capacidade Vital",
    icon: "timer",
  },
  4: {
    title: "Modulacao de Intensidade",
    description: "Variar a forca do sopro desenvolve o controle fino da intensidade vocal. Fonoaudiologos utilizam esse tipo de tarefa para tratar hipernasalidade e insuficiencia velofaringea.",
    skill: "Controle de Intensidade",
    icon: "wave",
  },
  5: {
    title: "Coord. Pneumofonoarticulatoria",
    description: "Voce esta sincronizando respiracao e acao motora, um principio chave da coordenacao pneumofonoarticulatoria (CPFA). Isso melhora a fluencia da fala e a projecao vocal.",
    skill: "CPFA",
    icon: "sync",
  },
  6: {
    title: "Resistencia Respiratoria",
    description: "A resistencia do sopro prolongado fortalece o diafragma e os musculos intercostais. Na clinica fonoaudiologica, pacientes pos-intubacao se beneficiam diretamente dessa pratica.",
    skill: "Endurance Respiratorio",
    icon: "shield",
  },
  7: {
    title: "Propriocepcao Oral",
    description: "Com a pratica continua, voce desenvolve maior consciencia dos orgaos fonoarticulatorios (labios, lingua, bochechas). Isso e crucial para a articulacao precisa dos fonemas.",
    skill: "Consciencia Orofacial",
    icon: "brain",
  },
  8: {
    title: "Controle do Véu Palatino",
    description: "O exercicio de sopro direcional ativa o musculo levantador do veu palatino, essencial para o fechamento velofaringeo. Pacientes com fissura labiopalatina treinam isso regularmente.",
    skill: "Fechamento Velofaringeo",
    icon: "target",
  },
}

function getSkillData(level: number) {
  const key = ((level - 1) % Object.keys(PEDAGOGICAL_DATA).length) + 1
  return PEDAGOGICAL_DATA[key]
}

// SVG icons for each skill type
function SkillIcon({ type }: { type: string }) {
  const iconProps = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "oklch(0.82 0.18 85)", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

  switch (type) {
    case "wind":
      return <svg {...iconProps}><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" /><path d="M9.6 4.6A2 2 0 1 1 11 8H2" /><path d="M12.6 19.4A2 2 0 1 0 14 16H2" /></svg>
    case "lungs":
      return <svg {...iconProps}><path d="M12 4v8" /><path d="M6 12c-1.7 0-3 1.3-3 3v1c0 1.7 1.3 3 3 3h1" /><path d="M18 12c1.7 0 3 1.3 3 3v1c0 1.7-1.3 3-3 3h-1" /><path d="M8 12a4 4 0 0 1 8 0" /></svg>
    case "timer":
      return <svg {...iconProps}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M9 1h6" /></svg>
    case "wave":
      return <svg {...iconProps}><path d="M2 12c1-3 3-5 5-5s4 4 6 4 4-4 5-4" /><path d="M2 17c1-3 3-5 5-5s4 4 6 4 4-4 5-4" /></svg>
    case "sync":
      return <svg {...iconProps}><path d="M21 12a9 9 0 0 0-9-9" /><path d="M3 12a9 9 0 0 0 9 9" /><path d="M21 3v9h-9" /><path d="M3 21v-9h9" /></svg>
    case "shield":
      return <svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
    case "brain":
      return <svg {...iconProps}><path d="M9.5 2A6.5 6.5 0 0 0 3 8.5c0 3 2 5.5 5 6.5v5h2V15" /><path d="M14.5 2A6.5 6.5 0 0 1 21 8.5c0 3-2 5.5-5 6.5v5h-2" /></svg>
    case "target":
      return <svg {...iconProps}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
    default:
      return <svg {...iconProps}><circle cx="12" cy="12" r="10" /></svg>
  }
}

export function LevelCompleteModal({ level, coins, isVisible, onContinue }: LevelCompleteModalProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShowContent(true), 200)
      return () => clearTimeout(timer)
    }
    setShowContent(false)
  }, [isVisible])

  if (!isVisible) return null

  const skill = getSkillData(level)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, oklch(0.18 0.12 290 / 0.95), oklch(0.08 0.04 285 / 0.98))",
          backdropFilter: "blur(12px)",
        }}
      />

      {/* Modal */}
      {showContent && (
        <div
          className="relative w-full max-w-sm rounded-2xl overflow-hidden animate-level-enter"
          style={{
            background: "linear-gradient(180deg, oklch(0.20 0.08 285), oklch(0.14 0.05 285))",
            border: "1px solid oklch(0.50 0.25 295 / 0.3)",
            boxShadow: "0 0 40px oklch(0.50 0.25 295 / 0.2), 0 0 80px oklch(0.78 0.18 195 / 0.1)",
          }}
        >
          {/* Top glow bar */}
          <div
            className="h-1 animate-shimmer"
            style={{
              backgroundImage: "linear-gradient(90deg, transparent, oklch(0.78 0.18 195), oklch(0.82 0.18 85), oklch(0.50 0.25 295), transparent)",
              backgroundSize: "200% 100%",
            }}
          />

          <div className="p-5">
            {/* Level complete header */}
            <div className="flex flex-col items-center mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyber-cyan/70 font-semibold mb-1">
                {'Nivel Completo'}
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.78 0.18 195), oklch(0.82 0.18 85))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {level * 10}
                </span>
                <span className="text-sm text-muted-foreground">andares</span>
              </div>
            </div>

            {/* Coin reward */}
            <div
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl mb-5"
              style={{
                background: "linear-gradient(135deg, oklch(0.20 0.06 85 / 0.3), oklch(0.16 0.04 85 / 0.2))",
                border: "1px solid oklch(0.82 0.18 85 / 0.2)",
              }}
            >
              {/* Spinning coin */}
              <div className="relative w-10 h-10 flex items-center justify-center" style={{ perspective: "100px" }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center animate-coin-spin"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.82 0.18 85), oklch(0.68 0.16 70))",
                    boxShadow: "0 0 12px oklch(0.82 0.18 85 / 0.4)",
                    border: "2px solid oklch(0.90 0.14 85 / 0.5)",
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: "oklch(0.25 0.06 85)" }}>C</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-cyber-gold">+{coins}</span>
                <span className="text-[10px] text-cyber-gold/60 uppercase tracking-wider">Moedas coletadas</span>
              </div>
            </div>

            {/* Pedagogical gain card */}
            <div
              className="rounded-xl p-4"
              style={{
                background: "linear-gradient(180deg, oklch(0.18 0.06 285 / 0.8), oklch(0.14 0.04 285 / 0.6))",
                border: "1px solid oklch(0.78 0.18 195 / 0.15)",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.22 0.08 285), oklch(0.18 0.06 290))",
                    border: "1px solid oklch(0.82 0.18 85 / 0.2)",
                  }}
                >
                  <SkillIcon type={skill.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-cyber-cyan/60 font-semibold">
                      Ganho fonoaudiologico
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-tight text-balance">
                    {skill.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground mb-3">
                {skill.description}
              </p>

              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: "oklch(0.78 0.18 195 / 0.1)",
                  border: "1px solid oklch(0.78 0.18 195 / 0.2)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan" />
                <span className="text-[10px] font-semibold text-cyber-cyan tracking-wide">
                  {skill.skill}
                </span>
              </div>
            </div>

            {/* Aura encouragement */}
            <div className="flex items-center gap-3 mt-4 mb-3">
              <div className="relative w-10 h-10 shrink-0">
                <div
                  role="img"
                  aria-label="Aura"
                  className="w-full h-full animate-float-gentle"
                  style={{
                    backgroundImage: "url(/assets/elevador/spritesheet.png)",
                    backgroundSize: "800% 100%",
                    backgroundPosition: "0 0",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {level <= 2
                  ? "Otimo comeco! Continue soprando para fortalecer sua respiracao."
                  : level <= 5
                    ? "Voce esta evoluindo muito! Seu controle de sopro esta cada vez melhor."
                    : "Impressionante! Voce domina o controle respiratorio como um profissional!"}
              </p>
            </div>

            {/* Continue button */}
            <button
              onClick={onContinue}
              className="w-full py-3.5 rounded-xl font-semibold text-sm active:scale-[0.97] transition-transform"
              style={{
                background: "linear-gradient(135deg, oklch(0.78 0.18 195), oklch(0.60 0.20 210))",
                color: "oklch(0.10 0.04 285)",
                boxShadow: "0 0 20px oklch(0.78 0.18 195 / 0.3)",
                border: "1px solid oklch(0.78 0.18 195 / 0.4)",
              }}
            >
              Continuar Subindo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
