"use client"

interface DecibelMeterProps {
  volume: number
  smoothVolume: number
  rawDb: number
  isListening: boolean
}

export function DecibelMeter({ volume, smoothVolume, rawDb, isListening }: DecibelMeterProps) {
  if (!isListening) return null

  const displayDb = Math.max(-60, Math.min(0, rawDb))

  // Ultra-thin arc meter: needle from -90 deg (left) to +90 deg (right)
  const normalizedAngle = ((displayDb + 60) / 60) * 180 - 90

  const segments = 32
  const arcRadius = 48
  const arcStart = -90
  const arcEnd = 90
  const arcSpan = arcEnd - arcStart

  // Height in meters
  const heightM = (smoothVolume * 100).toFixed(1)

  const getIntensityLabel = () => {
    if (volume < 0.05) return { text: "Silencio", color: "oklch(0.55 0.04 260)" }
    if (volume < 0.15) return { text: "Sopro leve", color: "oklch(0.78 0.18 195)" }
    if (volume < 0.35) return { text: "Sopro medio", color: "oklch(0.65 0.20 300)" }
    if (volume < 0.6) return { text: "Sopro forte", color: "oklch(0.82 0.18 85)" }
    return { text: "Maximo!", color: "oklch(0.85 0.20 85)" }
  }

  const intensity = getIntensityLabel()

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-2xl px-4 pt-2.5 pb-2"
        style={{
          background: "oklch(0.12 0.04 285 / 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid oklch(0.50 0.25 295 / 0.18)",
          boxShadow: volume > 0.15
            ? `0 0 25px oklch(0.78 0.18 195 / ${volume * 0.25}), inset 0 1px 0 oklch(1 0 0 / 0.04)`
            : "0 4px 24px oklch(0.08 0.02 285 / 0.6), inset 0 1px 0 oklch(1 0 0 / 0.03)",
          transition: "box-shadow 0.15s ease",
        }}
      >
        {/* Arc gauge SVG */}
        <svg width="130" height="72" viewBox="0 0 130 72" className="overflow-visible">
          {/* Arc background segments - ultra thin */}
          {Array.from({ length: segments }).map((_, i) => {
            const segAngle = arcStart + (i / segments) * arcSpan
            const segAngleRad = (segAngle * Math.PI) / 180
            const x1 = 65 + (arcRadius - 5) * Math.cos(segAngleRad)
            const y1 = 64 + (arcRadius - 5) * Math.sin(segAngleRad)
            const x2 = 65 + arcRadius * Math.cos(segAngleRad)
            const y2 = 64 + arcRadius * Math.sin(segAngleRad)

            const segNormalized = i / segments
            const isActive = segNormalized <= smoothVolume

            let color: string
            if (segNormalized < 0.35) {
              color = isActive ? "oklch(0.78 0.18 195)" : "oklch(0.22 0.04 280)"
            } else if (segNormalized < 0.65) {
              color = isActive ? "oklch(0.60 0.22 300)" : "oklch(0.22 0.04 280)"
            } else {
              color = isActive ? "oklch(0.82 0.18 85)" : "oklch(0.22 0.04 280)"
            }

            return (
              <line
                key={i}
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke={color}
                strokeWidth={1.8}
                strokeLinecap="round"
                opacity={isActive ? 1 : 0.25}
                style={{
                  filter: isActive ? `drop-shadow(0 0 2px ${color})` : "none",
                  transition: "opacity 0.05s ease, stroke 0.05s ease",
                }}
              />
            )
          })}

          {/* Outer glow arc when active */}
          {smoothVolume > 0.1 && (
            <circle
              cx={65} cy={64}
              r={arcRadius + 3}
              fill="none"
              stroke={intensity.color}
              strokeWidth={0.5}
              opacity={smoothVolume * 0.3}
              strokeDasharray="2 6"
            />
          )}

          {/* Tick labels */}
          {[-60, -30, 0].map((db) => {
            const norm = (db + 60) / 60
            const angle = arcStart + norm * arcSpan
            const angleRad = (angle * Math.PI) / 180
            const x = 65 + (arcRadius + 10) * Math.cos(angleRad)
            const y = 64 + (arcRadius + 10) * Math.sin(angleRad)

            return (
              <text
                key={db}
                x={x} y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="oklch(0.45 0.03 260)"
                fontSize="6"
                fontFamily="var(--font-mono)"
              >
                {db}
              </text>
            )
          })}

          {/* Needle - ultra thin */}
          <g
            style={{
              transform: `rotate(${normalizedAngle}deg)`,
              transformOrigin: "65px 64px",
              transition: "transform 0.06s ease-out",
            }}
          >
            <line
              x1={65} y1={64}
              x2={65} y2={64 - arcRadius + 8}
              stroke="oklch(0.82 0.18 85)"
              strokeWidth={1}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 4px oklch(0.82 0.18 85 / 0.6))" }}
            />
          </g>

          {/* Center pivot - minimal */}
          <circle
            cx={65} cy={64}
            r={3}
            fill="oklch(0.20 0.08 285)"
            stroke="oklch(0.82 0.18 85 / 0.5)"
            strokeWidth={1}
          />
          <circle
            cx={65} cy={64}
            r={1.2}
            fill="oklch(0.82 0.18 85)"
            style={{ filter: "drop-shadow(0 0 3px oklch(0.82 0.18 85 / 0.6))" }}
          />

          {/* dB value display */}
          <text
            x={65} y={48}
            textAnchor="middle"
            fill="oklch(0.95 0.02 200)"
            fontSize="15"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            {displayDb > -60 ? displayDb : "-inf"}
          </text>
          <text
            x={65} y={57}
            textAnchor="middle"
            fill="oklch(0.45 0.03 260)"
            fontSize="6"
            fontFamily="var(--font-mono)"
          >
            dB
          </text>
        </svg>

        {/* Bottom info row */}
        <div className="flex items-center justify-between -mt-1 px-1">
          <span
            className="text-[9px] font-semibold tracking-wider uppercase"
            style={{ color: intensity.color, transition: "color 0.15s" }}
          >
            {intensity.text}
          </span>
          <span className="text-[9px] text-muted-foreground font-mono tabular-nums">
            {heightM}m
          </span>
        </div>
      </div>
    </div>
  )
}
