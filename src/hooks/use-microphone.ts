"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseMicrophoneReturn {
  volume: number
  smoothVolume: number
  rawDb: number
  isListening: boolean
  isCalibrating: boolean
  isPermissionGranted: boolean
  error: string | null
  startListening: () => Promise<void>
  stopListening: () => void
  startCalibration: () => void
  finishCalibration: () => void
  sessionStats: SessionStats
}

export interface SessionStats {
  peakIntensity: number
  avgConsistency: number
  sustainTime: number
  totalBlowTime: number
  sessionDuration: number
}

export function useMicrophone(): UseMicrophoneReturn {
  const [volume, setVolume] = useState(0)
  const [smoothVolume, setSmoothVolume] = useState(0)
  const [rawDb, setRawDb] = useState(-60)
  const [isListening, setIsListening] = useState(false)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [isPermissionGranted, setIsPermissionGranted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    peakIntensity: 0,
    avgConsistency: 0,
    sustainTime: 0,
    totalBlowTime: 0,
    sessionDuration: 0,
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const smoothVolumeRef = useRef(0)

  // Calibration refs
  const calibMinRef = useRef(255)
  const calibMaxRef = useRef(0)

  // Session tracking refs
  const sessionStartRef = useRef(0)
  const blowStartRef = useRef(0)
  const totalBlowRef = useRef(0)
  const peakRef = useRef(0)
  const sampleCountRef = useRef(0)
  const consistencySumRef = useRef(0)
  const longestSustainRef = useRef(0)
  const currentSustainRef = useRef(0)
  const wasBlowingRef = useRef(false)

  const BLOW_THRESHOLD = 0.10
  const SMOOTHING_FACTOR = 0.15

  const analyze = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return

    analyserRef.current.getByteFrequencyData(dataArrayRef.current)

    const sum = dataArrayRef.current.reduce((a, b) => a + b, 0)
    const avg = sum / dataArrayRef.current.length

    // Apply calibration range
    const range = Math.max(calibMaxRef.current - calibMinRef.current, 40)
    const normalized = Math.min(Math.max((avg - calibMinRef.current) / range, 0), 1)

    // dB calculation
    const dbVal = normalized > 0.01 ? Math.round(20 * Math.log10(normalized)) : -60

    // Exponential smoothing
    smoothVolumeRef.current += (normalized - smoothVolumeRef.current) * SMOOTHING_FACTOR
    const smoothed = smoothVolumeRef.current

    setVolume(normalized)
    setSmoothVolume(smoothed)
    setRawDb(dbVal)

    // Track stats
    const isBlowing = smoothed > BLOW_THRESHOLD
    if (isBlowing) {
      if (!wasBlowingRef.current) {
        blowStartRef.current = performance.now()
        wasBlowingRef.current = true
      }
      currentSustainRef.current = (performance.now() - blowStartRef.current) / 1000
      if (currentSustainRef.current > longestSustainRef.current) {
        longestSustainRef.current = currentSustainRef.current
      }
      if (smoothed > peakRef.current) peakRef.current = smoothed
      sampleCountRef.current++
      consistencySumRef.current += smoothed
    } else {
      if (wasBlowingRef.current) {
        totalBlowRef.current += (performance.now() - blowStartRef.current) / 1000
        wasBlowingRef.current = false
        currentSustainRef.current = 0
      }
    }

    // Update session stats periodically
    if (sampleCountRef.current % 30 === 0 && sessionStartRef.current > 0) {
      const elapsed = (performance.now() - sessionStartRef.current) / 1000
      setSessionStats({
        peakIntensity: peakRef.current,
        avgConsistency: sampleCountRef.current > 0 ? consistencySumRef.current / sampleCountRef.current : 0,
        sustainTime: longestSustainRef.current,
        totalBlowTime: totalBlowRef.current,
        sessionDuration: elapsed,
      })
    }

    // Calibration mode: track min/max
    if (isCalibrating) {
      if (avg > 10 && avg > calibMaxRef.current) calibMaxRef.current = avg
      if (avg > 5 && avg < calibMinRef.current) calibMinRef.current = avg
    }

    animFrameRef.current = requestAnimationFrame(analyze)
  }, [isCalibrating])

  const startCalibration = useCallback(() => {
    calibMinRef.current = 255
    calibMaxRef.current = 0
    setIsCalibrating(true)
  }, [])

  const finishCalibration = useCallback(() => {
    setIsCalibrating(false)
    // Set reasonable defaults if calibration was too short
    if (calibMaxRef.current - calibMinRef.current < 15) {
      calibMinRef.current = 5
      calibMaxRef.current = 90
    }
  }, [])

  const startListening = useCallback(async () => {
    try {
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.75
      analyser.minDecibels = -90
      analyser.maxDecibels = -10

      source.connect(analyser)
      analyserRef.current = analyser

      const bufferLength = analyser.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)

      // Set default calibration
      calibMinRef.current = 5
      calibMaxRef.current = 90

      // Reset session stats
      sessionStartRef.current = performance.now()
      blowStartRef.current = 0
      totalBlowRef.current = 0
      peakRef.current = 0
      sampleCountRef.current = 0
      consistencySumRef.current = 0
      longestSustainRef.current = 0
      currentSustainRef.current = 0
      wasBlowingRef.current = false
      smoothVolumeRef.current = 0

      setIsPermissionGranted(true)
      setIsListening(true)

      animFrameRef.current = requestAnimationFrame(analyze)
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Permissao do microfone negada. Habilite nas configuracoes do navegador.")
      } else {
        setError("Erro ao acessar o microfone. Verifique se seu dispositivo possui um microfone.")
      }
    }
  }, [analyze])

  const stopListening = useCallback(() => {
    // Final stats snapshot
    if (sessionStartRef.current > 0) {
      if (wasBlowingRef.current) {
        totalBlowRef.current += (performance.now() - blowStartRef.current) / 1000
      }
      const elapsed = (performance.now() - sessionStartRef.current) / 1000
      setSessionStats({
        peakIntensity: peakRef.current,
        avgConsistency: sampleCountRef.current > 0 ? consistencySumRef.current / sampleCountRef.current : 0,
        sustainTime: longestSustainRef.current,
        totalBlowTime: totalBlowRef.current,
        sessionDuration: elapsed,
      })
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    dataArrayRef.current = null
    setIsListening(false)
    setVolume(0)
    setSmoothVolume(0)
    setRawDb(-60)
  }, [])

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  return {
    volume,
    smoothVolume,
    rawDb,
    isListening,
    isCalibrating,
    isPermissionGranted,
    error,
    startListening,
    stopListening,
    startCalibration,
    finishCalibration,
    sessionStats,
  }
}
