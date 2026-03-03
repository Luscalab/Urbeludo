"use client"

import Image from "next/image"

interface ElevatorCabinProps {
  isBlowing: boolean
  blowIntensity: number
}

export function ElevatorCabin({ isBlowing, blowIntensity }: ElevatorCabinProps) {
  const glowStrength = 0.3 + blowIntensity * 0.7

  return (
    <div className="relative flex flex-col items-center">
      {/* Elevator cables - twin cybernetic wires */}
      <div className="flex gap-[140px] justify-center mb-0">
        {[0, 0.5].map((delay, i) => (
          <div key={i} className="relative w-[2px] h-32">
            <div className="absolute inset-0 rounded-full bg-cyber-cyan/10" />
            <div
              className="absolute inset-0 rounded-full animate-circuit-pulse"
              style={{
                animationDelay: `${delay}s`,
                background: isBlowing
                  ? `linear-gradient(180deg, oklch(0.78 0.18 195 / ${glowStrength}), oklch(0.50 0.25 295 / ${glowStrength * 0.5}))`
                  : "linear-gradient(180deg, oklch(0.78 0.18 195 / 0.2), oklch(0.50 0.25 295 / 0.1))",
              }}
            />
            {/* Cable connector node */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
              style={{
                background: "oklch(0.78 0.18 195)",
                boxShadow: isBlowing
                  ? `0 0 10px oklch(0.78 0.18 195 / ${glowStrength})`
                  : "0 0 4px oklch(0.78 0.18 195 / 0.3)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Main cabin shell - glassmorphism */}
      <div
        className={`relative w-[200px] ${!isBlowing ? "animate-cabin-hover" : ""}`}
        style={{ aspectRatio: "9 / 14" }}
      >
        {/* Outer glassmorphism frame */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(180deg, oklch(0.22 0.08 290 / 0.55), oklch(0.15 0.05 285 / 0.65))",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isBlowing
              ? `1.5px solid oklch(0.78 0.18 195 / ${0.4 + blowIntensity * 0.4})`
              : "1.5px solid oklch(0.50 0.25 295 / 0.3)",
            boxShadow: isBlowing
              ? `0 0 ${20 + blowIntensity * 40}px oklch(0.78 0.18 195 / ${glowStrength * 0.4}),
                 0 0 ${50 + blowIntensity * 60}px oklch(0.50 0.25 295 / ${glowStrength * 0.2}),
                 inset 0 1px 0 oklch(1 0 0 / 0.08),
                 inset 0 0 ${20 + blowIntensity * 20}px oklch(0.78 0.18 195 / 0.06)`
              : `0 8px 40px oklch(0.10 0.04 285 / 0.6),
                 0 0 60px oklch(0.50 0.25 295 / 0.15),
                 inset 0 1px 0 oklch(1 0 0 / 0.06),
                 inset 0 0 12px oklch(0.50 0.25 295 / 0.04)`,
            transition: "box-shadow 0.15s ease, border-color 0.15s ease",
          }}
        />

        {/* Inner glass highlight top */}
        <div
          className="absolute top-0 left-0 right-0 h-[35%] rounded-t-2xl pointer-events-none"
          style={{
            background: "linear-gradient(180deg, oklch(1 0 0 / 0.06) 0%, transparent 100%)",
          }}
        />

        {/* Top indicator bar */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div
            className="h-8 rounded-t-2xl flex items-center justify-center gap-1.5"
            style={{
              background: "linear-gradient(180deg, oklch(0.28 0.10 290 / 0.75), oklch(0.20 0.06 285 / 0.4))",
              borderBottom: "1px solid oklch(0.78 0.18 195 / 0.12)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/60 animate-circuit-pulse" />
            <div className="w-6 h-px bg-cyber-cyan/20" />
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{
                background: isBlowing
                  ? `radial-gradient(circle, oklch(0.78 0.18 195), oklch(0.50 0.25 295))`
                  : `radial-gradient(circle, oklch(0.50 0.25 295 / 0.5), oklch(0.30 0.10 290))`,
                boxShadow: isBlowing
                  ? `0 0 12px oklch(0.78 0.18 195 / ${glowStrength})`
                  : "0 0 4px oklch(0.50 0.25 295 / 0.3)",
                transition: "all 0.15s ease",
              }}
            />
            <div className="w-6 h-px bg-cyber-cyan/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan/60 animate-circuit-pulse" style={{ animationDelay: "0.8s" }} />
          </div>
        </div>

        {/* Side rail accents */}
        <div
          className="absolute left-[5px] top-10 bottom-10 w-[1.5px] rounded-full"
          style={{ background: "linear-gradient(180deg, oklch(0.78 0.18 195 / 0.15), oklch(0.50 0.25 295 / 0.25), oklch(0.78 0.18 195 / 0.15))" }}
        />
        <div
          className="absolute right-[5px] top-10 bottom-10 w-[1.5px] rounded-full"
          style={{ background: "linear-gradient(180deg, oklch(0.78 0.18 195 / 0.15), oklch(0.50 0.25 295 / 0.25), oklch(0.78 0.18 195 / 0.15))" }}
        />

        {/* Side circuit nodes */}
        {[30, 50, 70].map((pct) => (
          <div key={pct}>
            <div
              className="absolute left-[2px] w-[7px] h-px bg-cyber-cyan/30"
              style={{ top: `${pct}%` }}
            />
            <div
              className="absolute right-[2px] w-[7px] h-px bg-cyber-cyan/30"
              style={{ top: `${pct}%` }}
            />
          </div>
        ))}

        {/* Scan line overlay */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden opacity-[0.04]">
          <div className="w-full h-16 bg-gradient-to-b from-transparent via-cyber-cyan to-transparent animate-scan-line" />
        </div>

        {/* ====== AURA ROBOT - main figure ====== */}
        <div className="absolute inset-0 flex items-center justify-center pt-8 pb-[28%] z-10">
          <div
            className="relative w-[72%] h-[72%]"
            style={{
              transform: isBlowing
                ? `translateY(-${blowIntensity * 8}px) scale(${1 + blowIntensity * 0.04})`
                : "translateY(0) scale(1)",
              transition: "transform 0.12s ease-out",
              filter: isBlowing
                ? `drop-shadow(0 0 ${12 + blowIntensity * 18}px oklch(0.78 0.18 195 / ${0.3 + blowIntensity * 0.5}))`
                : "drop-shadow(0 4px 12px oklch(0.50 0.25 295 / 0.3))",
            }}
          >
            <div
              role="img"
              aria-label="Aura, o robo do elevador"
              className="w-full h-full"
              style={{
                backgroundImage: "url(/assets/elevador/spritesheet.png)",
                backgroundSize: "800% 100%",
                backgroundPosition: "0 0",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        </div>

        {/* ====== REFLECTION / MIRROR on floor ====== */}
        <div
          className="absolute bottom-[5px] left-3 right-3 overflow-hidden rounded-b-xl z-[5]"
          style={{ height: "26%" }}
        >
          {/* Reflective glass surface */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, oklch(0.18 0.06 285 / 0.3), oklch(0.14 0.04 285 / 0.7))",
              borderTop: "1px solid oklch(0.78 0.18 195 / 0.1)",
            }}
          />
          {/* Reflected Aura (flipped) */}
          <div
            className="absolute inset-0 flex items-start justify-center pt-0"
            style={{
              transform: "scaleY(-1)",
              opacity: isBlowing ? 0.18 + blowIntensity * 0.08 : 0.15,
              filter: "blur(1.5px)",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 85%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 85%)",
              transition: "opacity 0.2s ease",
            }}
          >
            <div
              className="relative w-[65%]"
              style={{
                aspectRatio: "1 / 1",
                transform: isBlowing
                  ? `translateY(${blowIntensity * 8}px)`
                  : "translateY(0)",
                transition: "transform 0.12s ease-out",
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: "url(/assets/elevador/spritesheet.png)",
                  backgroundSize: "800% 100%",
                  backgroundPosition: "0 0",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
          </div>
          {/* Floor circuit pattern overlay */}
          <div className="absolute inset-0 flex items-end justify-center gap-1 pb-1.5 z-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-3 h-px bg-cyber-purple/15 rounded-full" />
            ))}
          </div>
        </div>

        {/* Energy particles when blowing */}
        {isBlowing && blowIntensity > 0.08 && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden z-20">
            {Array.from({ length: Math.ceil(blowIntensity * 10) }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  bottom: `${25 + Math.random() * 30}%`,
                  animation: `coin-float ${0.5 + Math.random() * 0.6}s ease-out forwards`,
                  animationDelay: `${i * 0.06}s`,
                  backgroundColor:
                    i % 3 === 0
                      ? "oklch(0.78 0.18 195 / 0.8)"
                      : i % 3 === 1
                        ? "oklch(0.50 0.25 295 / 0.7)"
                        : "oklch(0.82 0.18 85 / 0.6)",
                }}
              />
            ))}
          </div>
        )}

        {/* Bottom panel */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div
            className="h-[5px] rounded-b-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, oklch(0.20 0.06 285 / 0.5), oklch(0.25 0.08 290 / 0.7))",
              borderTop: "1px solid oklch(0.78 0.18 195 / 0.08)",
            }}
          />
        </div>
      </div>

      {/* Floor glow beneath cabin */}
      <div
        className="w-36 h-4 rounded-[50%] mt-0.5"
        style={{
          background: isBlowing
            ? `radial-gradient(ellipse, oklch(0.78 0.18 195 / ${0.15 + blowIntensity * 0.3}) 0%, transparent 70%)`
            : "radial-gradient(ellipse, oklch(0.50 0.25 295 / 0.1) 0%, transparent 70%)",
          transition: "all 0.2s",
        }}
      />
    </div>
  )
}
