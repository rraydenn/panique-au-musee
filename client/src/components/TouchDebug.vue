<template>
  <div v-if="isDebugMode" class="touch-debugger">
    <div class="debug-header">
      <h4>Touch Debug Panel</h4>
      <button @click="clearLog" class="clear-btn">Clear</button>
      <button @click="toggleDebug" class="close-btn">×</button>
    </div>
    <div class="debug-content">
      <div class="current-touches">
        <strong>Active Touches: {{ currentTouches.length }}</strong>
        <div v-for="(touch, index) in currentTouches" :key="index" class="touch-info">
          Touch {{ index }}: ({{ Math.round(touch.clientX) }}, {{ Math.round(touch.clientY) }})
        </div>
      </div>

      <!-- MyMap Logic Simulation -->
      <div class="mymap-simulation">
        <h5>MyMap Logic Simulation:</h5>
        <div class="simulation-info">
          <div>Long Press Active: {{ isLongPressActive ? 'YES' : 'NO' }}</div>
          <div>Timer Running: {{ longPressTimerRunning ? 'YES' : 'NO' }}</div>
          <div>Start Position: {{ startPosition.x }}, {{ startPosition.y }}</div>
          <div>Movement Delta: {{ movementDelta.x }}, {{ movementDelta.y }}</div>
          <div>Movement Threshold Exceeded: {{ movementThresholdExceeded ? 'YES' : 'NO' }}</div>
        </div>
      </div>

      <div class="event-log">
        <div v-for="event in eventLog" :key="event.id" class="log-entry">
          <span class="timestamp">{{ event.timestamp }}</span>
          <span class="event-type">{{ event.type }}</span>
          <span class="touch-count">{{ event.touchCount }} touches</span>
          <span class="simulation-result">{{ event.simulationResult }}</span>
          <div v-if="event.touches.length > 0" class="touch-details">
            <div v-for="(touch, idx) in event.touches" :key="idx">
              T{{ idx }}: ({{ touch.x }}, {{ touch.y }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Debug toggle button -->
  <button v-if="!isDebugMode" @click="toggleDebug" class="debug-toggle">
    🐛 Debug Touch
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TouchInfo {
  x: number
  y: number
  identifier: number
}

interface LogEvent {
  id: number
  timestamp: string
  type: string
  touchCount: number
  touches: TouchInfo[]
  simulationResult: string
}

const isDebugMode = ref(false)
const currentTouches = ref<Touch[]>([])
const eventLog = ref<LogEvent[]>([])
let eventCounter = 0

// MyMap simulation variables
const isLongPressActive = ref(false)
const longPressTimerRunning = ref(false)
const startPosition = ref({ x: 0, y: 0 })
const movementDelta = ref({ x: 0, y: 0 })
const movementThresholdExceeded = ref(false)
let longPressTimeout: number | null = null
const MOVE_THRESHOLD = 10 // Same as MyMap
const LONG_PRESS_DURATION = 1000 // Same as MyMap

const toggleDebug = () => {
  isDebugMode.value = !isDebugMode.value
  if (isDebugMode.value) {
    attachTouchListeners()
  } else {
    detachTouchListeners()
  }
}

const clearLog = () => {
  eventLog.value = []
  eventCounter = 0
  resetSimulation()
}

const resetSimulation = () => {
  isLongPressActive.value = false
  longPressTimerRunning.value = false
  startPosition.value = { x: 0, y: 0 }
  movementDelta.value = { x: 0, y: 0 }
  movementThresholdExceeded.value = false
  if (longPressTimeout) {
    clearTimeout(longPressTimeout)
    longPressTimeout = null
  }
}

const simulateMyMapLogic = (eventType: string, event: TouchEvent): string => {
  let result = ''

  if (eventType === 'touchstart') {
    // Simulate MyMap touchstart logic
    if (event.touches.length !== 1) {
      result = `❌ REJECTED: touches.length = ${event.touches.length} (not 1)`
      return result
    }

    const touch = event.touches[0] || event.changedTouches[0]
    if (!touch) {
      result = `❌ REJECTED: no touch found`
      return result
    }

    // Store starting position (same as MyMap)
    startPosition.value = { x: touch.clientX, y: touch.clientY }
    movementThresholdExceeded.value = false
    
    // Start long press timer (same as MyMap)
    longPressTimerRunning.value = true
    longPressTimeout = window.setTimeout(() => {
      isLongPressActive.value = true
      longPressTimerRunning.value = false
      result += ` ✅ LONG PRESS TRIGGERED!`
    }, LONG_PRESS_DURATION)

    result = `✅ ACCEPTED: Single touch started, timer started`

  } else if (eventType === 'touchend') {
    // Simulate MyMap touchend logic
    if (event.touches.length === 0) {
      if (longPressTimeout) {
        clearTimeout(longPressTimeout)
        longPressTimeout = null
      }
      longPressTimerRunning.value = false
      result = `🛑 CANCELLED: All touches ended`
    } else {
      result = `⚠️ PARTIAL END: ${event.touches.length} touches remaining`
    }

  } else if (eventType === 'touchmove') {
    // Simulate MyMap touchmove logic
    if (event.touches.length === 1) {
      const touch = event.touches[0]
      const deltaX = Math.abs(touch.clientX - startPosition.value.x)
      const deltaY = Math.abs(touch.clientY - startPosition.value.y)
      
      movementDelta.value = { x: deltaX, y: deltaY }
      
      // Check movement threshold (same as MyMap)
      if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
        movementThresholdExceeded.value = true
        if (longPressTimeout) {
          clearTimeout(longPressTimeout)
          longPressTimeout = null
        }
        longPressTimerRunning.value = false
        result = `🛑 CANCELLED: Movement exceeded threshold (${deltaX}, ${deltaY})`
      } else {
        result = `✅ MOVE OK: Delta (${deltaX}, ${deltaY}) within threshold`
      }
    } else {
      result = `❌ MOVE REJECTED: ${event.touches.length} touches (not 1)`
    }

  } else if (eventType === 'touchcancel') {
    // Simulate MyMap touchcancel logic
    if (longPressTimeout) {
      clearTimeout(longPressTimeout)
      longPressTimeout = null
    }
    longPressTimerRunning.value = false
    result = `🛑 CANCELLED: Touch cancelled`
  }

  return result
}

const logTouchEvent = (eventType: string, event: TouchEvent) => {
  const touches: TouchInfo[] = Array.from(event.touches).map(touch => ({
    x: Math.round(touch.clientX),
    y: Math.round(touch.clientY),
    identifier: touch.identifier
  }))

  // Simulate MyMap logic
  const simulationResult = simulateMyMapLogic(eventType, event)

  const logEvent: LogEvent = {
    id: ++eventCounter,
    timestamp: new Date().toLocaleTimeString(),
    type: eventType,
    touchCount: event.touches.length,
    touches,
    simulationResult
  }

  eventLog.value.unshift(logEvent)
  
  // Keep only last 15 events
  if (eventLog.value.length > 15) {
    eventLog.value = eventLog.value.slice(0, 15)
  }

  // Update current touches
  if (eventType === 'touchstart' || eventType === 'touchmove') {
    currentTouches.value = Array.from(event.touches)
  } else if (eventType === 'touchend' || eventType === 'touchcancel') {
    currentTouches.value = Array.from(event.touches)
  }
}

const touchStartHandler = (event: TouchEvent) => {
  logTouchEvent('touchstart', event)
}

const touchMoveHandler = (event: TouchEvent) => {
  logTouchEvent('touchmove', event)
}

const touchEndHandler = (event: TouchEvent) => {
  logTouchEvent('touchend', event)
}

const touchCancelHandler = (event: TouchEvent) => {
  logTouchEvent('touchcancel', event)
}

const attachTouchListeners = () => {
  // Use same approach as MyMap - attach to document or specific container
  document.addEventListener('touchstart', touchStartHandler, { passive: true })
  document.addEventListener('touchmove', touchMoveHandler, { passive: true })
  document.addEventListener('touchend', touchEndHandler, { passive: true })
  document.addEventListener('touchcancel', touchCancelHandler, { passive: true })
}

const detachTouchListeners = () => {
  document.removeEventListener('touchstart', touchStartHandler)
  document.removeEventListener('touchmove', touchMoveHandler)
  document.removeEventListener('touchend', touchEndHandler)
  document.removeEventListener('touchcancel', touchCancelHandler)
  resetSimulation()
}

onMounted(() => {
  // Auto-enable debug mode if in development
  if (import.meta.env.DEV) {
    isDebugMode.value = true
    attachTouchListeners()
  }
})

onUnmounted(() => {
  detachTouchListeners()
})
</script>

<style scoped>
.touch-debugger {
  position: fixed;
  top: 10px;
  left: 10px;
  right: 10px;
  max-height: 400px;
  background: rgba(0, 0, 0, 0.95);
  color: white;
  border-radius: 8px;
  z-index: 10000;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px 8px 0 0;
}

.debug-header h4 {
  margin: 0;
  font-size: 14px;
}

.clear-btn, .close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
}

.debug-content {
  padding: 12px;
  max-height: 340px;
  overflow-y: auto;
}

.current-touches {
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(0, 100, 0, 0.3);
  border-radius: 4px;
}

.touch-info {
  font-size: 10px;
  color: #90EE90;
}

.mymap-simulation {
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(0, 0, 100, 0.3);
  border-radius: 4px;
}

.mymap-simulation h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #87CEEB;
}

.simulation-info div {
  font-size: 10px;
  color: #87CEEB;
  margin: 2px 0;
}

.event-log {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 8px;
}

.log-entry {
  margin-bottom: 8px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  border-left: 3px solid #00ff00;
}

.timestamp {
  color: #888;
  font-size: 9px;
}

.event-type {
  color: #00ff00;
  font-weight: bold;
  margin: 0 8px;
}

.touch-count {
  color: #ffff00;
}

.simulation-result {
  display: block;
  color: #ff9900;
  font-size: 10px;
  margin-top: 2px;
  font-weight: bold;
}

.touch-details {
  margin-top: 4px;
  padding-left: 12px;
}

.touch-details div {
  font-size: 9px;
  color: #ccc;
}

.debug-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 50px;
  cursor: pointer;
  z-index: 9999;
  font-size: 12px;
}
</style>