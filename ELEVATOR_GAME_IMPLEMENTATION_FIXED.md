# Elevator Game - Implementation Guide (Corrected March 2026)

**Status**: Focused on REAL issues only  
**Complexity**: Low-Medium  
**Time Estimate**: 2-3 hours

---

## ✅ What's ALREADY Working (Don't touch!)

- Microphone error handling
- FFT size optimization (256)
- Audio context initialization
- Sprite animation system
- Physics and collision detection
- Calibration system

---

## 🔧 Fix 1: Audio Polyphony (2 hours) ⭐

### Problem
Currently only one sound plays at a time. If "coin" and "levelUp" sounds trigger simultaneously, only one is heard.

### File: `src/lib/audio-synthesis.ts`

**Create a Sound Queue System** (New approach):

```typescript
type SoundType = 'coin' | 'levelUp' | 'thud'

interface PlayingSound {
  oscillator: OscillatorNode
  gainNode: GainNode
  startTime: number
  duration: number
}

let audioContext: AudioContext | null = null
const playingSounds: Map<string, PlayingSound> = new Map()
let soundIdCounter = 0

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

export async function playSynthSound(type: SoundType) {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  const soundId = `${type}-${soundIdCounter++}`
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  const startTime = ctx.currentTime
  let duration = 0.1
  let frequency = 1200

  switch (type) {
    case 'coin':
      // Coin: sine wave 1200→2000 Hz for 100ms
      oscillator.type = 'sine'
      frequency = 1200
      oscillator.frequency.setValueAtTime(frequency, startTime)
      oscillator.frequency.exponentialRampToValueAtTime(2000, startTime + 0.1)
      gainNode.gain.setValueAtTime(0.15, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1)
      duration = 0.1
      break

    case 'levelUp':
      // Level up: chord progression A4→C#5→E5 for 600ms
      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(440, startTime)  // A4
      oscillator.frequency.setValueAtTime(554, startTime + 0.2)  // C#5
      oscillator.frequency.setValueAtTime(659, startTime + 0.4)  // E5
      gainNode.gain.setValueAtTime(0.2, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6)
      duration = 0.6
      break

    case 'thud':
      // Thud: sawtooth 100→20 Hz downward for 200ms
      oscillator.type = 'sawtooth'
      oscillator.frequency.setValueAtTime(100, startTime)
      oscillator.frequency.exponentialRampToValueAtTime(20, startTime + 0.2)
      gainNode.gain.setValueAtTime(0.2, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2)
      duration = 0.2
      break
  }

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)

  // Store reference to allow cleanup
  const sound: PlayingSound = {
    oscillator,
    gainNode,
    startTime,
    duration,
  }
  
  playingSounds.set(soundId, sound)

  // Auto-cleanup after sound finishes
  setTimeout(() => {
    playingSounds.delete(soundId)
  }, duration * 1000 + 100)
}
```

**Test**: 
```
1. Collect chest while leveling up simultaneously
2. Both sounds should play overlapping (coin + levelUp)
3. Should hear both, not just one
```

---

## 🎮 Fix 2: Game Balance - Difficulty Curve (30 min) ⭐

### Problem
Linear 5% difficulty increase causes frustration spike at level 4-5.  
Players quit because it suddenly becomes too hard.

### File: `src/lib/game-constants.ts`

**Current Code**:
```typescript
// In use-elevator-game.ts line ~125
const difficultyMultiplier = 1 + (currentLevel * 0.05)
```

**Fixed Code** (Exponential progression):
```typescript
// Smoother 8% per level progression
const difficultyMultiplier = Math.pow(1.08, currentLevel)

// Result:
// Level 0: 1.00x (easy)
// Level 1: 1.08x 
// Level 2: 1.17x
// Level 3: 1.26x
// Level 4: 1.36x (smooth increase, not sudden)
// Level 5: 1.47x
// Level 8: 1.85x
```

### Where to change:
File: `src/hooks/use-elevator-game.ts` (around line 125)

**Before**:
```typescript
const difficultyMultiplier = 1 + (currentLevel * 0.05)
```

**After**:
```typescript
const difficultyMultiplier = Math.pow(1.08, currentLevel)
```

**Testing**:
```
1. Play to level 5
2. Should feel progressively harder, not a sudden jump
3. Level 6+ should be challenging but fair
```

---

## 📱 Optional Enhancements (If Time Permits)

### Enhancement 1: Haptic Feedback (1 hour)
**Only if**: You want to verify Capacitor API works

```typescript
// src/lib/haptics.ts
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export async function triggerHaptic(event: 'coin' | 'levelUp' | 'thud') {
  try {
    const styles = { coin: ImpactStyle.Light, levelUp: ImpactStyle.Medium, thud: ImpactStyle.Heavy }
    await Haptics.impact({ style: styles[event] })
  } catch { } // Silently fail if not available
}
```

Then in `src/lib/audio-synthesis.ts`, add after each `playSynthSound`:
```typescript
// In playSynthSound function, before export
import { triggerHaptic } from './haptics'
triggerHaptic(type).catch(() => {}) // Don't block on haptic
```

---

### Enhancement 2: SVG Meter → Canvas (2-3 hours)
**Only if**: Testing on Galaxy A10/Moto G7 shows frame drops

Replace `src/components/decibel-meter.tsx` with Canvas implementation:
```typescript
// Use canvas instead of 32 SVG elements for much better performance
<canvas 
  ref={canvasRef}
  width={120}
  height={120}
  style={{
    filter: 'drop-shadow(0 0 8px oklch(0.78 0.18 195 / 0.3))'
  }}
/>
```

---

## 🧪 Testing Checklist

Before shipping, test these:

### Critical Tests
- [ ] Audio polyphony: Collect chest while leveling up. Hear BOTH sounds?
- [ ] Difficulty curve: Play to level 5. Does progression feel smooth (not sudden)?
- [ ] No crashes: Play for 30 minutes. Game stable?
- [ ] Memory: Monitor with Chrome DevTools. Stable or growing?

### Optional Tests
- [ ] Low-end Android: If FPS is bad, test Canvas meter optimization
- [ ] Haptic feedback: Test on real Android device if implemented
- [ ] Gesture controls: Test on device without microphone permission

---

## ⏱️ Quick Start (2-3 hours total)

1. **Read this file** (5 min)
2. **Implement audio polyphony** (2 hours)
   - Replace sound generation in `audio-synthesis.ts`
   - Test with simultaneous sounds
3. **Fix difficulty curve** (20 min)
   - Change formula in `use-elevator-game.ts`
   - Test difficulty feels right
4. **Test on device** (30 min)
   - Use real Android if possible
   - Or Chrome DevTools on desktop

**Total**: ~3 hours development + testing

---

## ❌ DO NOT IMPLEMENT

- ❌ Battery Status API (deprecated since 2021)
- ❌ User Agent device detection (fragile)
- ❌ Memory leak "fixes" (no actual leak exists)
- ❌ Additional microphone permission handling (already good)
- ❌ FFT size changes (already optimized)

---

## ✨ Success Criteria

After fixes, the game should:
- ✅ Play multiple sounds simultaneously without cutting off
- ✅ Have smooth difficulty progression (no frustration spike)
- ✅ Run smoothly on mid-range Android (55-60 FPS)
- ✅ Players enjoy reaching level 5+

---

**Version**: 2.0 (Focused on real issues)  
**Status**: Ready for implementation  
**Last Updated**: March 2026
