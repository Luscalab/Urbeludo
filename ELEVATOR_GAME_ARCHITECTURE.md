# Elevator Game - Architecture & Flow Reference

**Quick Start Guide for Developers**  
**Last Updated**: March 2026 (Updated from 2024)  
**Note**: Some features are already implemented - verify against current codebase  

---

## 🏗️ Component Architecture

```
elevator-game.tsx (Main Component)
├── Renders 6 visual layers
│   ├── Layer 1: Background images (LEVEL_HEIGHTS)
│   ├── Layer 2: Next level preview
│   ├── Layer 3: Cabin frame (fixed position)
│   ├── Layer 4: AURA sprite (y-position driven by physics)
│   ├── Layer 5: Game HUD (floor, coins, level)
│   └── Layer 6: Modals (level-up, final report)
│
├── Hooks:
│   ├── useElevatorGame() → Manages all game state & physics
│   └── useEffect(onWin) → Listens for game completion
│
└── Props received from ElevadorVoz wrapper:
    ├── onWin(points, achievement) → Callback on game finish
    ├── userName → For personalization
    └── onSuggestBreath → For hints
```

---

## 🎮 Game State Machine

```
START
  ↓
[User clicks "Play"]
  ↓
BIOSCAN (Microphone calibration screen)
  ├─ calibMinRef, calibMaxRef auto-adjust
  ├─ User blows to calibrate
  └─ Shows: "Preparando o microfone..."
  ↓
[User completes calibration]
  ↓
PLAYING (Active gameplay loop)
  ├─ Physics simulation via RAF (requestAnimationFrame)
  ├─ Microphone input continuously monitored (30-50 samples/sec)
  ├─ Visual updates at 60fps (or adaptive rate on battery saving)
  ├─ Chest collection every 10 floors
  └─ Level progression every CHEST_INTERVAL (10 floor) threshold
  ↓
[User clicks "Stop"/"Parar"]
  ↓
REPORT (Performance analysis screen)
  ├─ Shows: Constância Respiratória (breathing regularity)
  ├─ Shows: Pico de Intensidade (max blow force)
  ├─ Shows: Tempo de Sustentação (longest blow duration)
  ├─ Shows: Tempo Total de Sopro (total blow time)
  └─ Grade: Iniciante → Bom → Muito Bom → Excelente
  ↓
[User clicks "Fechar" / Back button]
  ↓
START (Resets completely)
```

---

## 🔊 Microphone & Audio System

### Input Flow
```
Physical microphone input
        ↓
navigator.mediaDevices.getUserMedia()
        ↓
AudioContext (Web Audio API)
        ↓
Analyser Node (FFT: Fast Fourier Transform)
        ↓
getByteFrequencyData() → 256-2048 frequency bins
        ↓
calculateVolume() → Map frequency data to 0-1 range
        ↓
Calibration: normalizedVolume mapped to 0-1 using min/max
        ↓
Exponential smoothing (factor: 0.15) for stability
        ↓
Output: smoothVolume, rawDb, sessionStats
```

### Calibration System
```
Start: calibMinRef = 5, calibMaxRef = 90 (defaults for desktop)

During bioscan:
  - Collect frequency data for 5 seconds
  - Track min/max values user produces
  - Auto-adjust calibMinRef & calibMaxRef
  - Result: Personalized microphone sensitivity

Formula:
  normalizedVolume = (currentFreq - calibMin) / (calibMax - calibMin)
  smoothVolume = smoothVolume * 0.85 + normalizedVolume * 0.15
```

### Game Decision Points (Using smoothVolume)
```
smoothVolume < BLOW_THRESHOLD (0.10)
  → Gravity applies: velocity -= currentGravity
  → AURA falls down

smoothVolume >= BLOW_THRESHOLD (0.10)
  → Positive force: velocity += smoothVolume * BASE_BLOW_FORCE (6.0)
  → AURA rises up

Math.abs(velocity) < 3.5 (Stability threshold)
  → Chest becomes "available" to collect
  → Otherwise: Chest "phasing" (not tangible)
```

---

## ⚙️ Physics System

### Constants
```typescript
BASE_GRAVITY = 0.8        // Downward acceleration per frame
BASE_BLOW_FORCE = 6.0     // Upward force multiplier for microphone input
MAX_VELOCITY = 8          // Terminal velocity cap
FRICTION = 0.96           // Velocity dampening factor
FLOOR_HEIGHT = 120px      // Elevator height per floor
BLOW_THRESHOLD = 0.10     // Min normalized volume to trigger lift
```

### Game Loop (60fps or adaptive)
```
1. Read smoothVolume from microphone
2. Apply forces:
   - If smoothVolume > BLOW_THRESHOLD:
       velocity += smoothVolume * 6.0
   - Else:
       velocity -= currentGravity
3. Apply friction:
   velocity *= 0.96
4. Clamp velocity:
   velocity = max(-8, min(8, velocity))
5. Update position:
   elevatorY += velocity
6. Collision handling:
   if (elevatorY < 0):
     elevatorY = 0
     velocity = 0
     if (velocity < -5): playSynthSound('thud')
7. Calculate game state:
   floor = floor(elevatorY / 120)
   maxFloor = max(maxFloor, floor)
   level = floor(floor / 10)
8. Check stability for chest:
   isStable = abs(velocity) < 3.5
```

### Difficulty Scaling
```
Level 0: Difficulty = 1.00x gravity
Level 1: Difficulty = 1.05x gravity (5% harder)
Level 2: Difficulty = 1.10x gravity
Level 3: Difficulty = 1.15x gravity
...
Level 8: Difficulty = 1.40x gravity

Formula: difficultyMultiplier = 1 + (currentLevel * 0.05)
```

---

## 🎁 Reward System

### Chest Collection
```
Appears at: Every CHEST_INTERVAL (10 floors)
  → Floor 10, 20, 30, 40, 50, etc.

Coin Reward Calculation:
  coinReward = floor(floor / 10) * 5 + 10
  
  Examples:
  - Floor 10: reward = (1 * 5) + 10 = 15 coins
  - Floor 20: reward = (2 * 5) + 10 = 20 coins
  - Floor 50: reward = (5 * 5) + 10 = 35 coins
  - Floor 100: reward = (10 * 5) + 10 = 60 coins

Requirement: abs(velocity) < 3.5 (Must be stable)

Visual Feedback:
  1. Chest lid animates open (50ms)
  2. 5 coin particles float upward
  3. Coin sound + haptic feedback
  4. Coins counter increments
```

### Level-Up System
```
Triggers: When collecting Nth chest and newLevel > lastLevel

Condition:
  newLevel = floor(floor / CHEST_INTERVAL)
  if (newLevel > lastLevelRef.current) → LEVEL UP!

Effects:
  1. levelUp sound plays + haptic feedback
  2. Modal dialog appears (blocks gameplay)
  3. Shows floor and level achieved
  4. Shows coins earned this level
  5. User clicks "Continuar" to resume
  
UI State:
  showLevelModal = true
  gamePaused = true
```

---

## 📊 Sprite & Animation System

### AURA Sprite Sheet
```
File: /assets/elevador/spritesheet.png
Layout: 8 frames horizontal strip
Frame size: 32x32 pixels
Total width: 256px (32 * 8)

Frames represent: Animation cycle (idle, breathing, movement)

Animation Driver: smoothVolume
  - Smooth volume = 0 → Frame 0 (idle)
  - Smooth volume = 0.5 → Frame 3-4 (medium breathing)
  - Smooth volume = 1.0 → Frame 7 (max breathing)

Formula:
  frameIndex = floor(smoothVolume * 8) % 8
  backgroundPosition = `${-frameIndex * 32}px 0`
```

### Other Animations
```
Start Screen: Sprite bounce (3s cycle)
  - opacity + drop-shadow glow

Level-Up Modal: entrance fade (200ms)
  - Scales in + fades in

Chest: lid rotation (300-500ms)
  - rotateX(-30deg) when opened

Coins: particle float animation
  - 5 coins with y-translation
  - Staggered timing (0s, 0.1s, 0.2s, 0.3s, 0.4s)
```

---

## 🎨 Visual Hierarchy

### Rendering Layers (Z-index)
```
z-50  ← Modals (Level-up, Report, Error dialogs)
z-40  ← HUD (Floor, Coins, Stop button)
z-10  ← Interactive layover (chest, particles)
z-1   ← AURA sprite (centered, y-position from physics)
z-0   ← Cabin frame (fixed overlay)
z-(-1) ← Current + next level background images
```

### Responsive Layout
```
Desktop (1200px+):
  - Container: 100% viewport
  - Scale: 1.0x
  - Touch targets: Normal (24-32px)

Tablet (768-1199px):
  - Container: 100% viewport
  - Scale: 1.0x
  - Touch targets: Increased (40-48px)

Mobile (< 768px):
  - Container: 100% viewport, portrait preferred
  - Scale: 1.0x with viewport-fit
  - Touch targets: Larger (48-56px min)
  - Safe area: Account for notches
```

---

## 🔌 Data Flow & Props

### Component Communication
```
ElevadorVoz (Wrapper)
  ↓ (provides props)
ElevatorGame
  ├─ receives props.onWin
  ├─ receives props.userName
  ├─ receives props.onSuggestBreath
  │
  ├─ calls useElevatorGame()
  │   ├─ manages phase state
  │   ├─ returns handlers: handleStart, handleStop, etc.
  │   └─ manages coins, floor, level state
  │
  ├─ renders child components:
  │   ├─ StartScreen
  │   ├─ BioScanScreen
  │   ├─ DecibelMeter (shows smoothVolume)
  │   ├─ GameHud (shows floor, coins, level)
  │   ├─ CyberChest (collectable)
  │   ├─ LevelCompleteModal
  │   └─ PerformanceReport
  │
  └─ calls handleWin() when phase='report'
      └─ props.onWin(totalCoins, achievementLevel)
```

### State Updates
```
Events that trigger state updates:

1. Floor change → setFloor(floor)
   - Updates floor in HUD
   - Triggers maxFloor check

2. Chest collection → handleCollectChest()
   - setCoins(coins + reward)
   - setCollectedChests (Set<number>)
   - Checks if level changed

3. Level milestone → setCurrentLevel(newLevel)
   - setShowLevelModal(true)
   - setGamePaused(true)

4. Background change → setFadeOpacity(0.5)
   - Triggers fade transition
   - Auto-restores to 1 after 750ms

5. Phase complete → setPhase('report')
   - Reads sessionStats from microphone hook
   - Prepares performance metrics
```

---

## 🐛 Common Issues & Debug Tips

### Issue: Game Won't Start After Permission Denial
**Cause**: No error handling for denied microphone permission  
**Fix**: Check `use-microphone.ts` for try-catch in `startListening`  
**Debug**: 
```javascript
// In browser console
navigator.permissions.query({ name: 'microphone' })
  .then(result => console.log(result.state))
```

### Issue: Elevator Moves Too Slowly/Quickly
**Cause**: Calibration out of range  
**Debug**: Check BioScan calibration screen output  
**Fix**: Manually adjust calibMinRef/calibMaxRef if needed

### Issue: Memory Usage Increases Over Time
**Cause**: setTimeout not cleared in background transitions  
**Fix**: Ensure useEffect cleanup function cancels timeout  
**Debug**: Use Chrome DevTools > Memory > Allocations timeline

### Issue: No Haptic Feedback on Android
**Cause**: `@capacitor/haptics` not installed or permission not granted  
**Fix**: Install package and check Android manifest permissions  
**Debug**: 
```javascript
Haptics.impact({ style: 1 }).then(() => console.log('Haptic worked'))
```

---

## 📈 Performance Metrics

### Target Performance
```
FPS:
  - Desktop: 60fps sustained
  - Android (mid-range): 50-60fps
  - Android (low-end): 30-45fps
  
Memory:
  - Initial load: 20-40MB
  - During gameplay: 60-100MB
  - Peak (with all assets): 120-150MB

Battery Drain (30 min gameplay):
  - 60fps mode: 20-30% drain
  - 30fps mode: 10-15% drain
  - WiFi only: 5-10% reduction

Audio Latency:
  - Microphone capture → visual response: < 50ms
  - Sound generation → playback: < 30ms
```

### Profiling Tools
```
Chrome DevTools:
  1. Performance tab → Record gameplay
  2. Look for dropped frames (red bars)
  3. Check JS execution time (should be < 16ms at 60fps)

Android Profiler (Android Studio):
  1. CPU: Monitor thread usage
  2. Memory: Check garbage collection patterns
  3. Battery: Monitor power consumption
  4. Network: Verify no unnecessary requests
```

---

## 🔄 Update & Maintenance

### File Dependencies
```
elevator-game.tsx
  ├─ imports: useElevatorGame hook
  ├─ imports: game-constants
  ├─ imports: audio-synthesis (playSynthSound)
  ├─ imports: performance-report component
  ├─ imports: level-complete-modal component
  ├─ imports: game-hud component
  └─ imports: decibel-meter component

use-elevator-game.ts
  ├─ imports: use-microphone hook
  ├─ imports: audio-synthesis (playSynthSound)
  └─ imports: game-constants

use-microphone.ts
  ├─ imports: Capacitor Preferences (for settings)
  └─ imports: Web Audio API (native browser)

game-constants.ts
  └─ No dependencies (pure constants)
```

### How to Adjust Game Difficulty
```
File: src/lib/game-constants.ts

Quick adjustments:
1. Gravity: Change BASE_GRAVITY (0.8 → increase for harder)
2. Blow force: Change BASE_BLOW_FORCE (6.0 → increase for more responsive)
3. Max velocity: Change MAX_VELOCITY (8 → cap on speed)
4. Blow threshold: Change BLOW_THRESHOLD (0.10 → higher = harder to initiate)

Difficulty curve (src/hooks/use-elevator-game.ts line 125):
  difficultyMultiplier = 1 + (currentLevel * 0.05)
  Change 0.05 to 0.10 for steeper curve
```

### How to Add New Sound Effects
```
File: src/lib/audio-synthesis.ts

1. Add new case in playSynthSound:
   case 'newSound':
     // Create oscillator, set frequency, duration
     oscillator.type = 'sine'
     oscillator.frequency.setValueAtTime(1200, ctx.currentTime)
     
2. Import in components:
   import { playSynthSound } from '@/lib/audio-synthesis'
   
3. Call in event handlers:
   await playSynthSound('newSound')
```

---

## 📚 Related Documentation

- [ELEVATOR_GAME_ANALYSIS.md](ELEVATOR_GAME_ANALYSIS.md) - Detailed technical analysis
- [ELEVATOR_GAME_IMPLEMENTATION.md](ELEVATOR_GAME_IMPLEMENTATION.md) - Implementation guide with code
- [game-constants.ts](src/lib/game-constants.ts) - All tunable parameters
- [package.json](package.json) - Dependencies

---

**Version**: 1.0  
**Status**: Complete  
**Audience**: Developers  
**Last Review**: 2024
