<template>
  <div v-if="show" class="catch-modal-overlay">
    <div class="catch-modal">
      <h2>{{ title }}</h2>
      <div class="player-info">
        <div v-if="caughtPlayer.image" class="avatar-container">
          <img :src="caughtPlayer.image" :alt="caughtPlayer.username" class="caught-avatar" />
        </div>
        <div class="player-name">
          <span>{{ message }}</span>
        </div>
      </div>
      <button @click="close" class="close-button">Fermer</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'CatchModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    caughtPlayer: {
      type: Object,
      default: () => ({
        id: '',
        username: '',
        image: '',
        role: ''
      })
    },
    userRole: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const title = ref('')
    const message = ref('')

    // Update title and message based on roles
    watch(() => [props.show, props.userRole, props.caughtPlayer], () => {
      if (props.show) {
        // Make the phone vibrate when modal appears
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200, 100, 200])
        }
        
        if (props.userRole === 'policier') {
          title.value = 'Voleur attrapé!'
          message.value = `Vous avez arrêté ${props.caughtPlayer.username}!`
        } else if (props.userRole === 'voleur') {
          title.value = 'Vous avez été attrapé!'
          message.value = `Un policier vous a arrêté!`
        }
      }
    }, { immediate: true })

    const close = () => {
      emit('close')
    }

    return {
      title,
      message,
      close
    }
  }
})
</script>

<style scoped>
.catch-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.catch-modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 400px;
  text-align: center;
  animation: shake 0.5s ease-in-out;
}

.player-info {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-container {
  margin-bottom: 10px;
}

.caught-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e74c3c;
}

.player-name {
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
}

.close-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.close-button:hover {
  background-color: #2980b9;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}
</style>