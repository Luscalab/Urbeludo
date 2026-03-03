"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import { useMicrophone } from "@/hooks/use-microphone"
import { DecibelMeter } from "@/components/decibel-meter"
import { StartScreen } from "@/components/start-screen"
import { BioScanScreen } from "@/components/bio-scan-screen"
import { GameHud } from "@/components/game-hud"
import { CyberChest } from "@/components/cyber-chest"
import { LevelCompleteModal } from "@/components/level-complete-modal"
import { PerformanceReport } from "@/components/performance-report"

// ====== GAME CONSTANTS ======
const GRAVITY = 0.8
const BLOW_FORCE = 6.0
const MAX_VELOCITY = 8
const FRICTION = 0.96
const FLOOR_HEIGHT = 120
const BLOW_THRESHOLD = 0.10
const CHEST_INTERVAL = 10

// ====== LEVEL SYSTEM ======
const LEVEL_HEIGHTS = [0, 600, 1200, 1800, 2400, 3000, 3600, 4200]
const BACKGROUND_IMAGES = [
  "/assets/elevador/1.png",
  "/assets/elevador/2.png",
  "/assets/elevador/3.png",
  "/assets/elevador/4.png",
  "/assets/elevador/5.png",
  "/assets/elevador/6.png",
  "/assets/elevador/7.png",
]

type GamePhase = "start" | "bioscan" | "playing" | "report"

export function ElevatorGame() {
  const {
    volume,
    smoothVolume,
    rawDb,
    isListening,
    error,
    startListening,
    stopListening,
    startCalibration,
    finishCalibration,
    sessionStats,
  } = useMicrophone()

  // ====== GAME STATE ======
  const [phase, setPhase] = useState<GamePhase>("start")
  const [elevatorY, setElevatorY] = useState(0)
  const [floor, setFloor] = useState(0)
  const [maxFloor, setMaxFloor] = useState(0)
  const [coins, setCoins] = useState(0)
  const [collectedChests, setCollectedChests] = useState<Set<number>>(new Set())
  const [currentLevel, setCurrentLevel] = useState(0)
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [levelCoinsReward, setLevelCoinsReward] = useState(0)
  const [gamePaused, setGamePaused] = useState(false)
  const [fadeOpacity, setFadeOpacity] = useState(1)

  // ====== PHYSICS REFS ======
  const velocityRef = useRef(0)
  const elevatorYRef = useRef(0)
  const animFrameRef = useRef(0)
  const lastLevelRef = useRef(0)
  const lastBackgroundRef = useRef(-1)

  // ====== EVENT HANDLERS ======
  const handleStart = useCallback(async () => {
    await startListening()
    setPhase("bioscan")
  }, [startListening])

  const handleBioScanComplete = useCallback(() => {
    setPhase("playing")
  }, [])

  const handleStop = useCallback(() => {
    setPhase("report")
    setGamePaused(true)
  }, [])

  const handleReportClose = useCallback(() => {
    stopListening()
    setPhase("start")
    setElevatorY(0)
    elevatorYRef.current = 0
    velocityRef.current = 0
    setFloor(0)
    setMaxFloor(0)
    setCurrentLevel(0)
    setCoins(0)
    setCollectedChests(new Set())
    lastLevelRef.current = 0
    lastBackgroundRef.current = -1
    setGamePaused(false)
  }, [stopListening])

  const handleCollectChest = useCallback((chestCoins: number) => {
    setCoins((prev) => prev + chestCoins)
    setCollectedChests((prev) => {
      const next = new Set(prev)
      next.add(floor)
      return next
    })

    const newLevel = Math.floor(floor / CHEST_INTERVAL)
    if (newLevel > lastLevelRef.current && newLevel > 0) {
      lastLevelRef.current = newLevel
      setCurrentLevel(newLevel)
      setLevelCoinsReward(chestCoins)
      setShowLevelModal(true)
      setGamePaused(true)
    }
  }, [floor])

  const handleContinueAfterLevel = useCallback(() => {
    setShowLevelModal(false)
    setGamePaused(false)
  }, [])

  // ====== LEVEL TRANSITION WITH FADE ======
  const getCurrentLevel = (height: number): number => {
    for (let i = LEVEL_HEIGHTS.length - 1; i >= 0; i--) {
      if (height >= LEVEL_HEIGHTS[i]) return i
    }
    return 0
  }

  // ====== GAME LOOP WITH PHYSICS ======
  useEffect(() => {
    if (phase !== "playing" || gamePaused) return

    const gameLoop = () => {
      const isBlowing = smoothVolume > BLOW_THRESHOLD

      if (isBlowing) {
        const force = smoothVolume * BLOW_FORCE
        velocityRef.current += force
      } else {
        velocityRef.current -= GRAVITY
      }

      velocityRef.current *= FRICTION
      velocityRef.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocityRef.current))

      elevatorYRef.current += velocityRef.current

      if (elevatorYRef.current < 0) {
        elevatorYRef.current = 0
        velocityRef.current = 0
      }

      setElevatorY(elevatorYRef.current)

      const currentFloor = Math.floor(elevatorYRef.current / FLOOR_HEIGHT)
      setFloor(currentFloor)
      setMaxFloor((prev) => Math.max(prev, currentFloor))

      // Background level detection
      const newLevel = getCurrentLevel(elevatorYRef.current)
      if (newLevel !== lastBackgroundRef.current) {
        lastBackgroundRef.current = newLevel
        // Trigger fade transition
        setFadeOpacity(0.5)
        setTimeout(() => setFadeOpacity(1), 750) // Half of transition time
      }

      animFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [phase, smoothVolume, gamePaused])

  const isBlowing = smoothVolume > BLOW_THRESHOLD
  const currentBackgroundLevel = getCurrentLevel(elevatorY)
  const nextBackgroundLevel = Math.min(currentBackgroundLevel + 1, BACKGROUND_IMAGES.length - 1)

  const nearestChestFloor = Math.round(floor / CHEST_INTERVAL) * CHEST_INTERVAL
  const isNearChest = nearestChestFloor > 0 && Math.abs(floor - nearestChestFloor) <= 1
  const chestAlreadyCollected = collectedChests.has(nearestChestFloor)

  // ====== AURA SPRITE ANIMATION ======
  const spriteFrameIndex = Math.floor((isBlowing ? smoothVolume * 8 : 2) % 8)

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
          className="relative w-32 h-32"
          style={{
            // Sprite animation: 8 frames, each frame is 1/8 of width
            backgroundImage: "url(/assets/elevador/spreedsheet.png)",
            backgroundPosition: `${spriteFrameIndex * -32}px 0`,
            backgroundSize: "256px 32px",
            backgroundRepeat: "no-repeat",
            width: "32px",
            height: "32px",
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
      {phase === "playing" && isNearChest && !chestAlreadyCollected && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-35"
          style={{
            top: `${20 + smoothVolume * 50}%`,
            transition: "top 0.1s ease-out",
          }}
        >
          <CyberChest
            floor={nearestChestFloor}
            isVisible={isNearChest && !chestAlreadyCollected}
            onCollect={handleCollectChest}
          />
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
