import { useState, useRef, useCallback, useEffect } from "react"
import { useMicrophone } from "@/hooks/use-microphone"
import { playSynthSound } from "@/lib/audio-synthesis"
import {
  BASE_GRAVITY,
  BASE_BLOW_FORCE,
  MAX_VELOCITY,
  FRICTION,
  FLOOR_HEIGHT,
  BLOW_THRESHOLD,
  CHEST_INTERVAL,
  LEVEL_HEIGHTS,
} from "@/lib/game-constants"


export type GamePhase = "start" | "bioscan" | "playing" | "report"

export function useElevatorGame() {
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
  const [isStable, setIsStable] = useState(true)

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
    playSynthSound("coin")
    setCoins((prev) => prev + chestCoins)
    setCollectedChests((prev) => {
      const next = new Set(prev)
      next.add(floor)
      return next
    })

    const newLevel = Math.floor(floor / CHEST_INTERVAL)
    if (newLevel > lastLevelRef.current && newLevel > 0) {
      playSynthSound("levelUp")
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

  // ====== LEVEL TRANSITION ======
  const getCurrentLevel = (height: number): number => {
    for (let i = LEVEL_HEIGHTS.length - 1; i >= 0; i--) {
      if (height >= LEVEL_HEIGHTS[i]) return i
    }
    return 0
  }

  // ====== GAME LOOP WITH PHYSICS ======
  useEffect(() => {
    if (phase !== "playing" || gamePaused) return

    // Progressive difficulty: Gravity increases by 5% each level
    const difficultyMultiplier = 1 + (currentLevel * 0.05)
    const currentGravity = BASE_GRAVITY * difficultyMultiplier

    const gameLoop = () => {
      const isBlowing = smoothVolume > BLOW_THRESHOLD

      if (isBlowing) {
        // Use a fixed force for keyboard, and variable for mic
        const force = smoothVolume * BASE_BLOW_FORCE
        velocityRef.current += force
      } else {
        velocityRef.current -= currentGravity
      }

      velocityRef.current *= FRICTION
      velocityRef.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, velocityRef.current))

      elevatorYRef.current += velocityRef.current

      if (elevatorYRef.current < 0) {
        if (velocityRef.current < -5) {
          playSynthSound("thud")
        }
        elevatorYRef.current = 0
        velocityRef.current = 0
      }

      setElevatorY(elevatorYRef.current)

      const currentFloor = Math.floor(elevatorYRef.current / FLOOR_HEIGHT)
      setFloor(currentFloor)
      setMaxFloor((prev) => Math.max(prev, currentFloor))

      // Stability check for chest collection
      // Player must be moving slowly (< 3.5) to "materialize" the chest
      const stable = Math.abs(velocityRef.current) < 3.5
      if (stable !== isStable) setIsStable(stable)

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
  }, [phase, smoothVolume, gamePaused, isStable, currentLevel])

  return {
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
    // Refs
    velocityRef,
    elevatorYRef,
    animFrameRef,
    lastLevelRef,
    lastBackgroundRef,
    // Event Handlers
    handleStart,
    handleBioScanComplete,
    handleStop,
    handleReportClose,
    handleCollectChest,
    handleContinueAfterLevel,
    // Level
    getCurrentLevel,
    setFadeOpacity,
    setElevatorY,
    setFloor,
    setMaxFloor,
    setIsStable,
  }
}
