// ====== AUDIO SYSTEM (Synthetic SFX) ======

let audioCtx: AudioContext | null = null

const getAudioContext = () => {
  if (audioCtx) return audioCtx
  if (typeof window !== "undefined") {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContext) {
      audioCtx = new AudioContext()
      return audioCtx
    }
  }
  return null
}

export const playSynthSound = (type: "coin" | "levelUp" | "thud") => {
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  const now = ctx.currentTime

  if (type === "coin") {
    osc.type = "sine"
    osc.frequency.setValueAtTime(1200, now)
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1)
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
    osc.start(now)
    osc.stop(now + 0.1)
  } else if (type === "levelUp") {
    osc.type = "triangle"
    osc.frequency.setValueAtTime(440, now) // A4
    osc.frequency.setValueAtTime(554, now + 0.1) // C#5
    osc.frequency.setValueAtTime(659, now + 0.2) // E5
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.linearRampToValueAtTime(0, now + 0.6)
    osc.start(now)
    osc.stop(now + 0.6)
  } else if (type === "thud") {
    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(100, now)
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.2)
    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
    osc.start(now)
    osc.stop(now + 0.2)
  }
}
