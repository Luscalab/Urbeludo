"use client"

import Image from "next/image"
import { DecibelMeter } from "@/components/decibel-meter"
import { StartScreen } from "@/components/start-screen"
import { BioScanScreen } from "@/components/bio-scan-screen"
import { GameHud } from "@/components/game-hud"
import { CyberChest } from "@/components/cyber-chest"
import { LevelCompleteModal } from "@/components/level-complete-modal"
import { PerformanceReport } from "@/components/performance-report"
import { useEffect } from "react"
import {
  AURA_SPRITE_WIDTH,
  AURA_SPRITE_HEIGHT,
  AURA_SPRITE_FRAMES,
  AURA_SPRITESHEET_WIDTH,
  BACKGROUND_IMAGES,
  BLOW_THRESHOLD,
  CHEST_INTERVAL,
} from "@/lib/game-constants"
import { useElevatorGame } from "@/hooks/use-elevator-game"

interface ElevatorGameProps {
  onWin?: (points: number, achievement: string) => void;
  userName?: string;
  onSuggestBreath?: () => void;
}

export function ElevatorGame(props?: ElevatorGameProps) {
  const {
    // Microphone
    volume,
    smoothVolume,
    rawDb,
    isListening,
    error,
    startCalibration,
    finishCalibration,
    sessionStats,
    // Game State
    phase,
    elevatorY,
    floor,
    maxFloor,
    coins,
    collectedChests,
    currentLevel,
    showLevelModal,
    levelCoinsReward,
    gamePaused,
    fadeOpacity,
    isStable,
    // Event Handlers
    handleStart,
    handleBioScanComplete,
    handleStop,
    handleReportClose,
    handleCollectChest,
    handleContinueAfterLevel,
    // Level
    getCurrentLevel,
  } = useElevatorGame()

  // Call onWin callback when game ends
  useEffect(() => {
    if (phase === "report" && props?.onWin) {
      // Use requestAnimationFrame to ensure state is updated
      const timer = requestAnimationFrame(() => {
        props.onWin?.(coins, `Elevador - Nível ${currentLevel + 1}`);
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [phase, coins, currentLevel, props]);
  
    const isBlowing = smoothVolume > BLOW_THRESHOLD
    const currentBackgroundLevel = getCurrentLevel(elevatorY)
    const nextBackgroundLevel = Math.min(currentBackgroundLevel + 1, BACKGROUND_IMAGES.length - 1)
  
    const nearestChestFloor = Math.round(floor / CHEST_INTERVAL) * CHEST_INTERVAL
    const isNearChest = nearestChestFloor > 0 && Math.abs(floor - nearestChestFloor) <= 1
    const chestAlreadyCollected = collectedChests.has(nearestChestFloor)
  
    // ====== AURA SPRITE ANIMATION ======
    const spriteFrameIndex = Math.floor(
      (isBlowing ? smoothVolume * AURA_SPRITE_FRAMES : 2) % AURA_SPRITE_FRAMES
    )

  return (
    <div className="relative w-full h-screen max-w-[430px] mx-auto overflow-hidden bg-black select-none touch-none">
      {/* ====== LAYER 1: BACKGROUND (Level System) ====== */}
      <div className="fixed inset-0 w-full h-screen overflow-hidden">
        {/* Current Level Background */}
        <Image
          src={BACKGROUND_IMAGES[currentBackgroundLevel]}
          alt={`Level ${currentBackgroundLevel + 1}`}
          fill
          className="object-cover"
          style={{
            opacity: fadeOpacity,
            transition: "opacity 1.5s ease-in-out",
          }}
          priority
          unoptimized
        />

        {/* Next Level Background (for smooth transition) */}
        {nextBackgroundLevel !== currentBackgroundLevel && (
          <Image
            src={BACKGROUND_IMAGES[nextBackgroundLevel]}
            alt={`Level ${nextBackgroundLevel + 1}`}
            fill
            className="object-cover absolute"
            style={{
              opacity: 1 - fadeOpacity,
              transition: "opacity 1.5s ease-in-out",
            }}
            unoptimized
          />
        )}

        {/* Vignette Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0,0,0,0.3) 100%)",
          }}
        />
      </div>

      {/* ====== LAYER 2: CABIN (Fixed Frame) ====== */}
      <div className="fixed inset-0 w-full h-screen pointer-events-none z-20">
        <Image
          src="/assets/elevador/cabine.png"
          alt="Elevator Cabin"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* ====== LAYER 3: AURA (Robot with Spritesheet Animation) ====== */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
        style={{
          transform: `translate(-50%, calc(-50% + ${isBlowing ? -10 : 0}px))`,
          transition: isBlowing ? "none" : "transform 0.3s ease-out",
          filter: isBlowing
            ? `drop-shadow(0 0 ${12 + smoothVolume * 20}px rgba(120, 200, 255, ${0.4 + smoothVolume * 0.3}))`
            : "drop-shadow(0 0 8px rgba(120, 200, 255, 0.2))",
        }}
      >
        <div
          className="relative"
          style={{
            backgroundImage: "url(/assets/elevador/spritesheet.png)",
            backgroundPosition: `${spriteFrameIndex * -AURA_SPRITE_WIDTH}px 0`,
            backgroundSize: `${AURA_SPRITESHEET_WIDTH}px ${AURA_SPRITE_HEIGHT}px`,
            backgroundRepeat: "no-repeat",
            width: `${AURA_SPRITE_WIDTH}px`,
            height: `${AURA_SPRITE_HEIGHT}px`,
            animation: "float-gentle 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* ====== LAYER 4: UI OVERLAYS ====== */}

      {/* HUD */}
      {phase === "playing" && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <GameHud
            floor={floor}
            maxFloor={maxFloor}
            coins={coins}
            isListening={isListening}
            onStop={handleStop}
            level={currentLevel}
          />
        </div>
      )}

      {/* Decibel Meter */}
      {phase === "playing" && !showLevelModal && (
        <div className="fixed bottom-3 left-0 right-0 flex justify-center z-40">
          <DecibelMeter
            volume={volume}
            smoothVolume={smoothVolume}
            rawDb={rawDb}
            isListening={isListening}
          />
        </div>
      )}

      {/* Cyber Chest Collectible */}
      {phase === "playing" && isNearChest && !chestAlreadyCollected && isStable && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-35"
          style={{
            top: `${20 + smoothVolume * 50}%`,
            transition: "top 0.1s ease-out",
          }}
        >
          <CyberChest
            floor={nearestChestFloor}
            isVisible={isNearChest && !chestAlreadyCollected && isStable}
            onCollect={handleCollectChest}
          />
        </div>
      )}

      {/* "Too Fast" Warning for Chest */}
      {phase === "playing" && isNearChest && !chestAlreadyCollected && !isStable && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-35"
          style={{
            top: `${20 + smoothVolume * 50}%`,
            transition: "top 0.1s ease-out",
          }}
        >
          <div className="flex flex-col items-center gap-1 text-center font-black uppercase">
            <p className="text-sm text-yellow-300 tracking-widest -mb-1">Muito Rápido</p>
            <p className="text-[9px] text-white/60 tracking-wider">Desacelere para coletar</p>
          </div>
        </div>
      )}

      {/* Level Complete Modal */}
      <LevelCompleteModal
        level={currentLevel}
        coins={levelCoinsReward}
        isVisible={showLevelModal}
        onContinue={handleContinueAfterLevel}
      />

      {/* Performance Report */}
      <PerformanceReport
        stats={sessionStats}
        totalCoins={coins}
        maxFloor={maxFloor}
        maxLevel={currentLevel}
        isVisible={phase === "report"}
        onClose={handleReportClose}
      />

      {/* Bio-Scan Screen */}
      {phase === "bioscan" && (
        <div className="fixed inset-0 z-50">
          <BioScanScreen
            onComplete={handleBioScanComplete}
            volume={volume}
            isListening={isListening}
            onStartCalibration={startCalibration}
            onFinishCalibration={finishCalibration}
          />
        </div>
      )}

      {/* Start Screen overlay */}
      {phase === "start" && (
        <div className="fixed inset-0 z-50">
          <StartScreen onStart={handleStart} error={error} />
        </div>
      )}

      {/* ====== GLOBAL STYLES FOR SPRITE ANIMATION ====== */}
      <style>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
