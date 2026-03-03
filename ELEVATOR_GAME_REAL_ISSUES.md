# Elevator Game - ACTUAL Issues to Fix (March 2026)

**Date**: March 3, 2026  
**Status**: Real issues identified after review  
**Priority**: HIGH - These are confirmed, not speculative

---

## ✅ What's ALREADY WORKING (Don't fix these!)

| Feature | Status | Evidence |
|---------|--------|----------|
| Microphone error handling | ✅ Implemented | Lines 150-155 in use-microphone.ts |
| FFT size optimization | ✅ Optimized | Already using 256 (not 2048) |
| Error messages in Portuguese | ✅ Done | Clear user-facing messages |
| Microphone calibration system | ✅ Functional | Auto-adjusts min/max during bioscan |
| Session stats tracking | ✅ Complete | All metrics collected and displayed |
| Audio context lifecycle | ✅ Proper | Clean startup and cleanup |

---

## 🔴 REAL Issues That Need Fixing

### 1. **Audio Polyphony** ⭐ HIGH PRIORITY
**Description**: Only one sound effect plays at a time. If coin and level-up trigger simultaneously, only one plays.

**Where to Fix**: `src/lib/audio-synthesis.ts`

**Current Code**:
```typescript
// Only one oscillator connection at a time
const gainNode = audioContext.createGain()
gainNode.connect(audioContext.destination)
```

**Impact**: 
- Players don't hear both sounds when collecting chest + leveling up
- Feels unresponsive

**Effort**: 1-2 hours

**How to Implement**:
1. Create a SoundQueue class to manage multiple sounds
2. Instead of stopping previous sound, let it finish
3. Mix multiple sounds to audioContext.destination

---

### 2. **Game Balance - Difficulty Spike at Level 4** ⭐ HIGH PRIORITY  
**Description**: Game is too easy levels 0-3, then suddenly too hard at 4-5

**Where to Fix**: `src/hooks/use-elevator-game.ts` line 125 + `src/lib/game-constants.ts`

**Current Code**:
```typescript
// Linear 5% increase per level
const difficultyMultiplier = 1 + (currentLevel * 0.05)
// Level 3: 1.15x (easy), Level 4: 1.20x (suddenly harder)
// Level 5: 1.25x (even harder) <- Big jump
```

**Impact**:
- Players quit around level 4-5
- Retention drops significantly

**Effort**: 30 minutes

**How to Implement**:
```typescript
// Option 1: Use exponential increase
const difficultyMultiplier = Math.pow(1.08, currentLevel)

// Option 2: Use S-curve for smoother progression  
const difficultyMultiplier = 0.5 * (1 + Math.tanh((currentLevel - 3) / 1.5))
```

---

### 3. **SVG Meter Performance on Low-End Android** ⭐ MEDIUM PRIORITY
**Description**: 32 SVG elements animating every frame causes jank on budget phones

**Where to Fix**: `src/components/decibel-meter.tsx`

**Current Code**:
```tsx
// 32 SVG path elements, each rerending 60fps
{Array.from({ length: 32 }).map((_, i) => (
  <path key={i} ... />
))}
```

**Impact**:
- Frame drops on Galaxy A10, Moto G7
- Battery drain higher than necessary

**Effort**: 2-3 hours

**How to Implement**:
- Replace with Canvas-based rendering
- Single canvas element instead of 32 SVG paths
- Much faster (can handle 60fps on low-end devices)

---

### 4. **Missing Haptic Feedback** ⭐ MEDIUM PRIORITY
**Description**: No vibration feedback makes game feel less premium

**Where to Fix**: Create `src/lib/haptics.ts` (new file)

**Impact**:
- Game feels less responsive
- Reduced tactile engagement

**Effort**: 1 hour (after API verification)

**Requirements**:
- MUST verify @capacitor/haptics v5 API before coding
- Current ImpactStyle enum syntax unknown (needs check)
- Should test on real Android device

---

### 5. **No Gesture Control Backup** 🟡 MEDIUM PRIORITY
**Description**: Game relies entirely on microphone - if microphone breaks, game is unplayable

**Where to Fix**: `src/components/elevator-game.tsx`

**Options**:
1. Add touch-to-blow feature (tap = blow)
2. Add swipe gestures (swipe up = blow, swipe down = inverse)
3. Allow keyboard control (spacebar = blow)

**Impact**:
- Users with broken microphone can still play
- Better accessibility

**Effort**: 2-3 hours

---

### 6. **Safe Area Not Properly Handled** 🟡 LOW PRIORITY
**Description**: HUD may be cut off by notches on modern Android devices

**Where to Fix**: `src/components/game-hud.tsx`

**Impact**:
- Navigation buttons obscured on high-end devices with notches
- Less critical than other issues

**Effort**: 1 hour (if SafeArea API exists)

**Requirements**:
- Verify @capacitor/safe-area package exists
- Check if getInsets() API is correct

---

## 📊 Implementation Priority & Timeline

### Priority 1: FIX NOW (Today-Tomorrow)
1. **Audio Polyphony** - Makes game feel broken
2. **Game Balance** - Causes user quit-out at level 4

**Time**: 2-3 hours combined

### Priority 2: FIX SOON (This week)
3. **Haptic Feedback** - Premium feature
4. **SVG Meter Performance** - Only needed if testing on low-end Android

**Time**: 3-4 hours combined

### Priority 3: FIX LATER (Next week)
5. **Gesture Control** - Good-to-have fallback
6. **Safe Area** - Only if testing on notched devices

**Time**: 3-4 hours combined

---

## ⚠️ DO NOT IMPLEMENT (Wastes of Time)

- ❌ Battery Status API (deprecated, removed from all modern browsers)
- ❌ User Agent device detection (fragile, unreliable)
- ❌ webkitAudioContext fallback (not needed in 2026)
- ❌ navigator.permissions.query (not supported on Safari, Android < 46)
- ❌ FFT size changes (already optimized at 256)
- ❌ Microphone error handling improvements (already solid)

---

## ✨ VERIFIED GOOD (Don't touch these!)

- ✅ Physics system (gravity, velocity, friction)
- ✅ Sprite animation system
- ✅ Level progression logic
- ✅ Coin reward calculation
- ✅ Chest collection mechanism
- ✅ Performance report metrics
- ✅ Game state machine
- ✅ Microphone input processing
- ✅ Audio synthesis (coin, levelUp, thud)

---

## 🔧 Recommended Action Plan

1. **Verify audio polyphony problem** (5 min)
   - Open game
   - Collect chest while at level-up point
   - Check if both sounds play (should only hear one currently)

2. **Test game balance** (10 min)
   - Play to level 5
   - Note difficulty jump at 4-5
   - Confirm it's noticeable

3. **Implement audio polyphony** (1-2 hours)
   - Create SoundQueue module
   - Test with rapid chest collection

4. **Adjust difficulty curve** (30 min)
   - Change multiplier formula
   - Test progression feels smoother

5. **Test on low-end Android** (optional)
   - If getting performance complaints, implement Canvas meter
   - Otherwise SVG is fine

6. **Add haptic feedback** (1 hour)
   - After verifying @capacitor/haptics API
   - Test on real Android device

7. **Consider gesture control** (2-3 hours)
   - Add optional touch/swipe controls
   - Make microphone optional, not required

---

## 📝 Verification Checklist Before Writing Code

Before implementing anything above, verify these:

- [ ] Audio polyphony issue confirmed (both sounds DON'T play simultaneously)
- [ ] Difficulty spike at level 4 confirmed (feels noticeably harder)
- [ ] SVG meter causes frame drops on low-end Android (test required)
- [ ] @capacitor/haptics API signature verified (check docs)
- [ ] @capacitor/safe-area exists and works (check package)
- [ ] No memory leak in fadeOpacity state (profile app memory)

---

## 📞 Questions to Answer

1. **Has the game been tested on actual Android device?**
   - Test priority changes based on answer
   - Performance issues only matter if actually occurring

2. **What Android versions are being targeted?**
   - API availability depends on this
   - Haptics support varies by Android version

3. **Is haptic feedback critical for launch?**
   - If yes: priority bumps up, needs quick verification
   - If no: can be deferred

4. **Are gesture controls needed? Or microphone-only is fine?**
   - Affects scope significantly
   - Accessibility concern vs. scope creep

---

**Document Version**: 1.0 (Real Issues Only)  
**Status**: Ready for Implementation  
**Next Step**: Verify issues before coding
