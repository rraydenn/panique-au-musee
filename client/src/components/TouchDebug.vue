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
      <div class="event-log">
        <div v-for="event in eventLog" :key="event.id" class="log-entry">
          <span class="timestamp">{{ event.timestamp }}</span>
          <span class="event-type">{{ event.type }}</span>
          <span class="touch-count">{{ event.touchCount }} touches</span>
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
}

const isDebugMode = ref(false)
const currentTouches = ref<Touch[]>([])
const eventLog = ref<LogEvent[]>([])
let eventCounter = 0

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
}

const logTouchEvent = (eventType: string, event: TouchEvent) => {
  const touches: TouchInfo[] = Array.from(event.touches).map(touch => ({
    x: Math.round(touch.clientX),
    y: Math.round(touch.clientY),
    identifier: touch.identifier
  }))

  const logEvent: LogEvent = {
    id: ++eventCounter,
    timestamp: new Date().toLocaleTimeString(),
    type: eventType,
    touchCount: event.touches.length,
    touches
  }

  eventLog.value.unshift(logEvent)
  
  // Keep only last 20 events
  if (eventLog.value.length > 20) {
    eventLog.value = eventLog.value.slice(0, 20)
  }

  // Update current touches for touchstart and touchmove
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
  max-height: 300px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  z-index: 10000;
  font-family: 'Courier New', monospace;
  font-size: 12px;
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
  max-height: 240px;
  overflow-y: auto;
}

.current-touches {
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(0, 100, 0, 0.3);
  border-radius: 4px;
}

.touch-info {
  font-size: 11px;
  color: #90EE90;
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
  font-size: 10px;
}

.event-type {
  color: #00ff00;
  font-weight: bold;
  margin: 0 8px;
}

.touch-count {
  color: #ffff00;
}

.touch-details {
  margin-top: 4px;
  padding-left: 12px;
}

.touch-details div {
  font-size: 10px;
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