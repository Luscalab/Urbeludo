# Elevator Game - Implementation Guide for Premium Android

**Purpose**: Step-by-step code implementations for critical issues and premium features  
**Complexity**: Medium  
**Estimated Time**: 2-3 days of development  
**⚠️ STATUS**: Some sections have been corrected/removed - see ELEVATOR_GAME_REVIEW_CORRECTIONS.md

**SECTIONS NEEDING REVISION**:
- Section 2: Microphone Permission Error Handling (already implemented - can be removed)
- Section 5: Battery Adaptive FPS (should use prefers-reduced-motion, not deprecated Battery API)
- Section 3: Microphone Calibration (remove User Agent detection, use capability detection instead)
- Section 4: Haptics API types need verification before implementation  

---

## 1. Fix Memory Leak in Game Loop

### ⚠️ BEFORE IMPLEMENTING
**Status**: This issue needs verification. See ELEVATOR_GAME_REVIEW_CORRECTIONS.md - the actual code uses fadeOpacity state, not raw setTimeout. Re-analysis needed before implementing.

### File: `src/hooks/use-elevator-game.ts`

**Current Code** (Lines 130-175):
```typescript
// Background level detection
const newLevel = getCurrentLevel(elevatorYRef.current)
if (newLevel !== lastBackgroundRef.current) {
  lastBackgroundRef.current = newLevel
  // Trigger fade transition
  setFadeOpacity(0.5)
  setTimeout(() => setFadeOpacity(1), 750)  // ⚠️ Memory leak!
}
```

**Fixed Code**:
```typescript
// Create a separate effect to handle background transitions
useEffect(() => {
  const gameLoop = () => {
    // ... existing physics code ...
    
    const newLevel = getCurrentLevel(elevatorYRef.current)
    if (newLevel !== lastBackgroundRef.current) {
      lastBackgroundRef.current = newLevel
      setFadeOpacity(0.5)  // Signal for transition start
    }
    
    animFrameRef.current = requestAnimationFrame(gameLoop)
  }

  if (phase === "playing" && !gamePaused) {
    animFrameRef.current = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animFrameRef.current)
  }
}, [phase, gamePaused, smoothVolume, isStable, currentLevel])

// Separate effect for fade restoration with proper cleanup
useEffect(() => {
  if (fadeOpacity === 0.5) {
    const fadeTimeout = setTimeout(() => setFadeOpacity(1), 750)
    return () => clearTimeout(fadeTimeout)
  }
}, [fadeOpacity])
```

---

## 2. ✅ Microphone Permission Error Handling - ALREADY IMPLEMENTED

### Status: SKIP THIS SECTION
**Evidence**: This is already implemented in `src/hooks/use-microphone.ts` (lines 150-155)

**What's Already Done**:
- ✅ Catches NotAllowedError with user message
- ✅ Catches NotFoundError for missing microphone
- ✅ Catches NotReadableError for device in use
- ✅ Clear error messaging in Portuguese
- ✅ Proper cleanup of audio context

**No action needed** - Move to next section

### File: `src/hooks/use-microphone.ts`

**Add Error State Management** (Around line 30):
```typescript
const [error, setError] = useState<string | null>(null)
const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt')
```

**Update `startListening` function** (Lines 50-80):
```typescript
const startListening = useCallback(async () => {
  try {
    setError(null)  // Clear previous errors
    
    // Check permission status first (iOS/Android)
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: 'microphone' })
      setPermissionStatus(result.state as any)
      
      if (result.state === 'denied') {
        setError(
          'Permissão de microfone negada. Acesse Configurações > Permissões para conceder acesso.'
        )
        throw new Error('MICROPHONE_DENIED')
      }
    }

    // Stop any existing stream first
    engineRef.current?.disconnect()
    sourceRef.current?.disconnect()
    
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false,
      },
    })

    // ... rest of existing audio setup code ...
    
  } catch (err: any) {
    console.error('Microphone error:', err)
    
    let userMessage = 'Erro ao acessar o microfone'
    
    if (err.name === 'NotAllowedError' || err.message === 'MICROPHONE_DENIED') {
      userMessage = 'Microfone não foi autorizado. Vá para Configurações > Permissões para permitir.'
    } else if (err.name === 'NotFoundError') {
      userMessage = 'Nenhum microfone detectado neste dispositivo.'
    } else if (err.name === 'NotReadableError') {
      userMessage = 'Microfone já está em uso por outro aplicativo.'
    } else if (err.name === 'SecurityError') {
      userMessage = 'Acesso ao microfone negado por razões de segurança. Use HTTPS.'
    } else if (err.message?.includes('timeout')) {
      userMessage = 'Tempo limite ao acessar microfone. Tente novamente.'
    }
    
    setError(userMessage)
    throw err
  }
}, [])
```

**Add Retry Mechanism**:
```typescript
const retryStartListening = useCallback(async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await startListening()
      return  // Success
    } catch (err) {
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }
  // All retries failed
  throw new Error('Failed to start microphone after retries')
}, [startListening])

// Add to return object
return {
  // ... existing returns ...
  error,
  permissionStatus,
  retryStartListening,
}
```

### File: `src/components/elevator-game.tsx`

**Add Error Display** (Near bioscan screen rendering):
```tsx
// In render, after bioscan screen:
{phase === "bioscan" && error && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div
      className="bg-red-900/80 border border-red-400 rounded-lg p-6 max-w-sm text-center"
      style={{
        background: "linear-gradient(180deg, oklch(0.40 0.20 10), oklch(0.30 0.15 10))",
        border: "1px solid oklch(0.60 0.25 10)"
      }}
    >
      <p className="text-red-100 mb-4">{error}</p>
      <button
        onClick={() => retryStartListening()}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
      >
        Tentar Novamente
      </button>
      <button
        onClick={() => setPhase("start")}
        className="ml-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
      >
        Voltar
      </button>
    </div>
  </div>
)}
```

---

## 3. Dynamic Microphone Calibration for Android

### Problem
Hardcoded calibration min/max (5/90) doesn't match Android microphone variations.

### File: `src/hooks/use-microphone.ts`

**Add Device Detection** (Around line 20):
```typescript
const [deviceCapabilities, setDeviceCapabilities] = useState({
  micType: 'unknown',
  estimatedQuality: 'medium',
  recommendedFftSize: 512,
})

const detectMicrophoneCapabilities = useCallback(async () => {
  try {
    // For now, use heuristics. Could be enhanced with actual device detection
    const ua = navigator.userAgent.toLowerCase()
    
    let micType = 'unknown'
    let quality = 'medium'
    
    // Budget phone detection
    if (ua.includes('samsung a10') || ua.includes('moto g7') || ua.includes('moto e')) {
      micType = 'budget'
      quality = 'low'
    }
    // Premium device detection
    else if (ua.includes('galaxy s') || ua.includes('pixel')) {
      micType = 'premium'
      quality = 'high'
    }
    
    setDeviceCapabilities({
      micType,
      estimatedQuality: quality,
      recommendedFftSize: quality === 'high' ? 2048 : quality === 'low' ? 256 : 512
    })
  } catch (e) {
    console.warn('Could not detect microphone capabilities')
  }
}, [])

useEffect(() => {
  detectMicrophoneCapabilities()
}, [detectMicrophoneCapabilities])
```

**Adjust Calibration Based on Device** (Lines 140-160):
```typescript
const initializeAudioContext = useCallback(() => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    
    // Adjust based on device capabilities
    analyser.fftSize = deviceCapabilities.recommendedFftSize || 512
    analyser.smoothingTimeConstant = 0.1
    
    // Dynamic calibration defaults
    let defaultMin = 5
    let defaultMax = 90
    
    if (deviceCapabilities.estimatedQuality === 'low') {
      defaultMin = 3
      defaultMax = 70
    } else if (deviceCapabilities.estimatedQuality === 'high') {
      defaultMin = 8
      defaultMax = 100
    }
    
    calibMinRef.current = defaultMin
    calibMaxRef.current = defaultMax
    
    return { audioContext, analyser }
  } catch (e) {
    console.error('Audio context error:', e)
    throw e
  }
}, [deviceCapabilities.estimatedQuality, deviceCapabilities.recommendedFftSize])
```

---

## 4. Add Haptic Feedback System

### Problem
No tactile feedback; users feel less engaged.

### New File: `src/lib/haptics.ts`

```typescript
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

export type HapticEvent = 'coin' | 'levelUp' | 'thud' | 'collision' | 'gameOver'

interface HapticPattern {
  style: ImpactStyle
  duration?: number
}

const hapticPatterns: Record<HapticEvent, HapticPattern | null> = {
  coin: { style: ImpactStyle.Light },
  levelUp: { style: ImpactStyle.Medium },
  thud: { style: ImpactStyle.Heavy },
  collision: { style: ImpactStyle.Medium },
  gameOver: { style: ImpactStyle.Heavy },
}

export async function triggerHaptic(event: HapticEvent): Promise<void> {
  try {
    const pattern = hapticPatterns[event]
    if (!pattern) return
    
    await Haptics.impact({ style: pattern.style })
  } catch (error) {
    // Silently fail if haptics not available (browser environment)
    console.debug('Haptics not available:', error)
  }
}

export async function triggerNotification(type: 'SUCCESS' | 'WARNING' | 'ERROR'): Promise<void> {
  try {
    const notificationType: NotificationType = {
      'SUCCESS': NotificationType.Success,
      'WARNING': NotificationType.Warning,
      'ERROR': NotificationType.Error,
    }[type]
    
    await Haptics.notification({ type: notificationType })
  } catch (error) {
    console.debug('Notification haptic failed:', error)
  }
}
```

### File: `src/lib/audio-synthesis.ts`

**Update to Include Haptic Feedback**:
```typescript
import { triggerHaptic } from './haptics'

export async function playSynthSound(type: 'coin' | 'levelUp' | 'thud') {
  // Play sound (existing code)
  // ... sound generation code ...
  
  // Add haptic feedback in parallel
  triggerHaptic(type).catch(() => {})  // Don't block on haptic
}
```

### File: `src/components/cyber-chest.tsx`

**Add Haptic on Collection**:
```typescript
import { triggerHaptic } from '@/lib/haptics'

const handleCollect = async () => {
  if (isOpened) return
  
  setIsOpened(true)
  setShowCoins(true)
  
  // Trigger haptic feedback
  await triggerHaptic('coin')
  
  onCollect(coinReward)
  setTimeout(() => setShowCoins(false), 1200)
}
```

---

## 5. Implement Adaptive Frame Rate for Battery

### Problem
Constant 60fps drains battery on low-end Android devices.

### New File: `src/lib/battery-manager.ts`

```typescript
export type BatteryLevel = 'critical' | 'low' | 'medium' | 'high' | 'full'

interface BatteryStatus {
  level: number
  charging: boolean
  savingMode: boolean
}

export class BatteryManager {
  private static status: BatteryStatus = {
    level: 0.5,
    charging: false,
    savingMode: false,
  }

  static async initialize(): Promise<void> {
    try {
      // Try Battery Status API (deprecated but still supported)
      if ('getBattery' in navigator) {
        const battery = (navigator as any).getBattery()
        battery.addEventListener('levelchange', () => this.updateStatus(battery))
        battery.addEventListener('chargingchange', () => this.updateStatus(battery))
        this.updateStatus(battery)
      }
      
      // Monitor for low power mode on iOS
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQuery.addEventListener('change', () => {
        this.status.savingMode = mediaQuery.matches
      })
      this.status.savingMode = mediaQuery.matches
    } catch (e) {
      console.debug('Battery API not available')
    }
  }

  private static updateStatus(battery: any) {
    this.status.level = battery.level
    this.status.charging = battery.charging
  }

  static getOptimalFrameRate(): number {
    if (this.status.charging) return 60
    if (this.status.savingMode) return 30
    
    const level = this.status.level
    if (level < 0.1) return 20  // Critical
    if (level < 0.2) return 30  // Low
    if (level < 0.5) return 45  // Medium
    return 60  // High/Full
  }

  static getOptimalAudioFftSize(): number {
    return this.status.level < 0.3 ? 256 : 512
  }

  static shouldReduceParticles(): boolean {
    return this.status.level < 0.3 || this.status.savingMode
  }
}
```

### File: `src/hooks/use-elevator-game.ts`

**Update Game Loop with Adaptive FPS**:
```typescript
import { BatteryManager } from '@/lib/battery-manager'

// Initialize battery monitoring
useEffect(() => {
  BatteryManager.initialize()
}, [])

// Update game loop
useEffect(() => {
  if (phase !== "playing" || gamePaused) return

  const targetFps = BatteryManager.getOptimalFrameRate()
  const frameInterval = 1000 / targetFps
  let lastFrameTime = 0

  const gameLoop = (timestamp: number) => {
    if (timestamp - lastFrameTime >= frameInterval) {
      // ... existing physics calculations ...
      lastFrameTime = timestamp
    }

    animFrameRef.current = requestAnimationFrame(gameLoop)
  }

  animFrameRef.current = requestAnimationFrame(gameLoop)

  return () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
  }
}, [phase, gamePaused, smoothVolume, isStable, currentLevel])
```

---

## 6. Optimize Microphone Audio Processing

### Problem
FFT size 2048 is overkill for blow detection; reduces performance on Android.

### File: `src/hooks/use-microphone.ts`

**Update Analyzer Setup** (Around line 110):
```typescript
const initializeAudioContext = useCallback(() => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const analyser = audioContext.createAnalyser()
  
  // Reduce FFT for faster computation
  const fftSize = BatteryManager.getOptimalAudioFftSize()  // 256 or 512
  analyser.fftSize = fftSize
  analyser.smoothingTimeConstant = 0.15  // Keep 15% smoothing
  
  // ... rest of setup ...
  return { audioContext, analyser }
}, [])

// Reduce sample grab frequency on battery critical
const sampleInverval = BatteryManager.status.level < 0.1 ? 50 : 30  // ms

setInterval(() => {
  getFrequencyData()
}, sampleInterval)
```

---

## 7. Safe Area Layout for Android Notches

### Problem
HUD gets cut off by notches/punch-holes on modern Android devices.

### File: `src/components/game-hud.tsx`

**Add Safe Area Support** (Top of component):
```typescript
import { useEffect, useState } from 'react'
import { SafeArea } from '@capacitor/safe-area'

interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

export function GameHud({ floor, maxFloor, coins, isListening, onStop, level }: GameHudProps) {
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  useEffect(() => {
    const loadSafeArea = async () => {
      try {
        const insets = await SafeArea.getInsets()
        setSafeArea(insets)
      } catch (e) {
        // Fallback to defaults if API not available
        setSafeArea({ top: 16, bottom: 16, left: 0, right: 0 })
      }
    }
    
    loadSafeArea()
  }, [])

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
      style={{
        paddingTop: `${safeArea.top + 16}px`,
        paddingLeft: `${safeArea.left + 12}px`,
        paddingRight: `${safeArea.right + 12}px`,
      }}
    >
      {/* Rest of HUD content unchanged */}
    </div>
  )
}
```

---

## 8. Add Performance Mode Settings (Optional Feature)

### New File: `src/components/PerformanceModeSelector.tsx`

```typescript
"use client"

import { useState, useCallback } from 'react'
import { Zap, Gauge, Leaf } from 'lucide-react'
import { Preferences } from '@capacitor/preferences'

type PerformanceMode = 'battery-saver' | 'balanced' | 'high-performance'

export interface PerformanceSettings {
  fps: number
  particleCount: number
  audioFft: number
  spriteUpdateRate: number
  description: string
}

export const performanceModes: Record<PerformanceMode, PerformanceSettings> = {
  'battery-saver': {
    fps: 30,
    particleCount: 2,
    audioFft: 256,
    spriteUpdateRate: 100,
    description: 'Máxima economia de bateria'
  },
  'balanced': {
    fps: 60,
    particleCount: 5,
    audioFft: 512,
    spriteUpdateRate: 50,
    description: 'Desempenho e bateria equilibrados'
  },
  'high-performance': {
    fps: 60,
    particleCount: 8,
    audioFft: 2048,
    spriteUpdateRate: 16,
    description: 'Melhor qualidade visual'
  }
}

export function PerformanceModeSelector() {
  const [mode, setMode] = useState<PerformanceMode>('balanced')

  const handleModeChange = useCallback(async (newMode: PerformanceMode) => {
    setMode(newMode)
    await Preferences.set({
      key: 'performanceMode',
      value: newMode
    })
  }, [])

  return (
    <div className="grid grid-cols-3 gap-2">
      {Object.entries(performanceModes).map(([key, settings]) => (
        <button
          key={key}
          onClick={() => handleModeChange(key as PerformanceMode)}
          className={`p-3 rounded-lg text-center transition-all ${
            mode === key
              ? 'bg-primary border-2 border-cyan-400'
              : 'bg-secondary border border-gray-600'
          }`}
        >
          {key === 'battery-saver' && <Leaf className="w-5 h-5 mx-auto mb-1" />}
          {key === 'balanced' && <Gauge className="w-5 h-5 mx-auto mb-1" />}
          {key === 'high-performance' && <Zap className="w-5 h-5 mx-auto mb-1" />}
          <p className="text-xs font-semibold">{settings.description}</p>
        </button>
      ))}
    </div>
  )
}
```

---

## Implementation Checklist

### Phase 1: Critical Fixes
- [ ] Fix memory leak in background transition (game-constants.ts)
- [ ] Add microphone permission error handling (use-microphone.ts)
- [ ] Add error display UI (elevator-game.tsx)
- [ ] Test on real Android device

**Estimated Time**: 4-6 hours

### Phase 2: Performance
- [ ] Implement haptic feedback (new haptics.ts file)
- [ ] Add battery manager (new battery-manager.ts file)
- [ ] Update game loop with adaptive FPS
- [ ] Optimize microphone audio processing

**Estimated Time**: 6-8 hours

### Phase 3: Android Features
- [ ] Add safe area support (game-hud.tsx)
- [ ] Implement performance mode selector (new component)
- [ ] Test on 3+ different Android devices

**Estimated Time**: 4-5 hours

### Phase 4: Testing & Polish
- [ ] Profile battery drain
- [ ] Monitor memory usage
- [ ] QA on low/mid/high-end devices
- [ ] Performance regression testing

**Estimated Time**: 8 hours

---

## Testing Procedures

### Permission Testing
```bash
# Simulate permission denial (in DevTools console)
navigator.permissions.query = () => Promise.resolve({ state: 'denied' })
```

### Battery Testing
```bash
# Mock low battery
Object.defineProperty(navigator, 'getBattery', {
  value: () => ({
    level: 0.1,
    charging: false,
    addEventListener: () => {}
  })
})
```

### Performance Testing
Use Chrome DevTools:
1. Open Performance tab
2. Start recording
3. Play game for 30 seconds
4. Stop recording
5. Check FPS graph (should maintain 60fps or configured rate)

---

## Dependencies to Add

Add to `package.json`:
```json
{
  "dependencies": {
    "@capacitor/haptics": "^5.0.0",
    "@capacitor/safe-area": "^5.0.0",
    "@capacitor/preferences": "^5.0.0"
  }
}
```

Install:
```bash
npm install @capacitor/haptics @capacitor/safe-area @capacitor/preferences
```

---

**Document Version**: 1.0  
**Status**: Ready for Implementation  
**Last Updated**: 2024
