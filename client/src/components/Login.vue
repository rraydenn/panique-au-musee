<template>
  <div class="login-form">
    <div class="form-group">
      <label for="login">Identifiant :</label>
      <input type="text" name="login" id="login" v-model="loginValue" placeholder="Votre identifiant" />
    </div>
    
    <div class="form-group">
      <label for="password">Mot de passe :</label>
      <input type="password" name="password" id="password" v-model="passwordValue" placeholder="Votre mot de passe" />
    </div>
    
    <div class="form-actions">
      <button @click="login" class="login-button">
        🔓 Se connecter
      </button>
    </div>
    
    <div v-if="message" class="message">
      {{ message }}
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { API_CONFIG } from '@/config/api'

export default {
  name: 'MyLogin',
  props: {
    message: String,
  },
  emits: ['login-success', 'login-error'],
  setup(props, { emit }) {
    const loginValue = ref('')
    const passwordValue = ref('')
    
    const login = async () => {
      if (!loginValue.value || !passwordValue.value) {
        emit('login-error', 'Veuillez renseigner votre login et mot de passe.')
        return
      }

      try {
        const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
          },
          body: JSON.stringify({
            login: loginValue.value,
            password: passwordValue.value,
          }),
        })

        if (response.ok) {
          const authHeader = response.headers.get('authorization')
          if(authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            localStorage.setItem('token', token)
            localStorage.setItem('login', loginValue.value)

            try {
              const gameResponse = await fetch(`${API_CONFIG.GAME_BASE_URL}/resources`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Origin': window.location.origin,
                }
              })

              if (gameResponse.ok) {
                const gameData = await gameResponse.json()
                const currentUser = gameData.find((resource: any) => resource.id === loginValue.value)

                if (currentUser && currentUser.role) {
                  localStorage.setItem('userRole', currentUser.role)
                } else {
                  await fetchUserProfileRole(token, loginValue.value)
                }
              } else {
                console.warn('Could not fetch game data, falling back to profile')
                await fetchUserProfileRole(token, loginValue.value)
              }
            } catch (gameError) {
              console.warn('Error fetching game role:', gameError)
              await fetchUserProfileRole(token, loginValue.value)
            }

            emit('login-success', { token, login: loginValue.value })
          }
        } else {
          emit('login-error', "Nom d'utilisateur ou mot de passe incorrect.")
          return
        }
      } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        emit('login-error', 'Une erreur est survenue lors de la connexion.')
      }
    }

    const fetchUserProfileRole = async (token: string, username: string) => {
      try {
        const profileResponse = await fetch(`${API_CONFIG.AUTH_BASE_URL}/users/${username}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Origin': window.location.origin,
          },
        })
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          const userRole = profileData.species || 'VOLEUR'
          localStorage.setItem('userRole', userRole)
          console.log('User profile role retrieved:', userRole)
        } else {
          console.warn('Could not fetch user profile, using default role')
          localStorage.setItem('userRole', 'VOLEUR')
        }
      } catch (profileError) {
        console.warn('Error fetching profile:', profileError)
        localStorage.setItem('userRole', 'VOLEUR')
      }
    }

    return {
      loginValue,
      passwordValue,
      login
    }
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border-radius: var(--button-radius);
}

.form-actions {
  text-align: center;
  margin-top: 2rem;
}

.login-button {
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
}

.message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: var(--button-radius);
  text-align: center;
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  color: #e74c3c;
}
</style>