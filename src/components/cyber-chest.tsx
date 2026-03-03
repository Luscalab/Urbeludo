"use client"

import { useState, useEffect } from "react"

interface CyberChestProps {
  floor: number
  isVisible: boolean
  onCollect: (coins: number) => void
}

export function CyberChest({ floor, isVisible, onCollect }: CyberChestProps) {
  const [isOpened, setIsOpened] = useState(false)
  const [showCoins, setShowCoins] = useState(false)
  const coinReward = Math.floor(floor / 10) * 5 + 10

  useEffect(() => {
    if (!isVisible) {
      setIsOpened(false)
      setShowCoins(false)
    }
  }, [isVisible])

  const handleCollect = () => {
    if (isOpened) return
    setIsOpened(true)
    setShowCoins(true)
    onCollect(coinReward)
    setTimeout(() => setShowCoins(false), 1200)
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleCollect}
      disabled={isOpened}
      className="relative flex flex-col items-center"
      aria-label={`Bau cibernetico - andar ${floor}`}
    >
      {/* Floating coins animation */}
      {showCoins && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-coin-float"
              style={{
                left: `${-20 + i * 10}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{
                  background: "linear-gradient(135deg, oklch(0.82 0.18 85), oklch(0.70 0.16 70))",
                  color: "oklch(0.20 0.04 85)",
                  boxShadow: "0 0 8px oklch(0.82 0.18 85 / 0.5)",
                }}
              >
                $
              </div>
            </div>
          ))}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-cyber-gold">
            +{coinReward}
          </div>
        </div>
      )}

      {/* Chest body */}
      <div
        className={`relative w-16 h-14 rounded-lg transition-all duration-300 ${isOpened ? "opacity-60" : "animate-chest-glow cursor-pointer active:scale-95"}`}
        style={{
          background: isOpened
            ? "linear-gradient(180deg, oklch(0.30 0.06 280), oklch(0.22 0.04 280))"
            : "linear-gradient(180deg, oklch(0.40 0.12 285), oklch(0.25 0.10 290))",
          border: "1.5px solid",
          borderColor: isOpened
            ? "oklch(0.40 0.08 280)"
            : "oklch(0.82 0.18 85 / 0.5)",
        }}
      >
        {/* Lid */}
        <div
          className="absolute -top-1 left-0 right-0 h-5 rounded-t-lg transition-transform duration-500"
          style={{
            background: isOpened
              ? "linear-gradient(180deg, oklch(0.35 0.08 280), oklch(0.30 0.06 280))"
              : "linear-gradient(180deg, oklch(0.50 0.15 290), oklch(0.40 0.12 285))",
            borderBottom: "1px solid oklch(0.82 0.18 85 / 0.3)",
            transform: isOpened ? "rotateX(-30deg) translateY(-4px)" : "none",
            transformOrigin: "top center",
          }}
        >
          {/* Lock circuit */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-4 h-3 rounded-sm border"
              style={{
                borderColor: isOpened
                  ? "oklch(0.50 0.08 280)"
                  : "oklch(0.82 0.18 85 / 0.7)",
                background: isOpened
                  ? "oklch(0.30 0.06 280)"
                  : "radial-gradient(circle, oklch(0.82 0.18 85 / 0.4), transparent)",
              }}
            >
              {!isOpened && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-gold animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Circuit lines on chest body */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-1 justify-center">
          <div className="w-2 h-px bg-cyber-cyan/30" />
          <div className="w-1 h-1 rounded-full bg-cyber-cyan/40" />
          <div className="w-4 h-px bg-cyber-cyan/30" />
          <div className="w-1 h-1 rounded-full bg-cyber-cyan/40" />
          <div className="w-2 h-px bg-cyber-cyan/30" />
        </div>

        {/* Inner glow when opened */}
        {isOpened && (
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: "radial-gradient(ellipse at center 30%, oklch(0.82 0.18 85 / 0.1), transparent 60%)",
            }}
          />
        )}
      </div>

      {/* Label */}
      {!isOpened && (
        <span className="text-[9px] text-cyber-gold/70 mt-1 uppercase tracking-wider font-semibold">
          Toque para abrir
        </span>
      )}
    </button>
  )
}
