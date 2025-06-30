<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import Login from './components/Login.vue'
import { API_CONFIG } from '@/config/api'

const logged = ref(false)
const loginError = ref('')
const login = ref('')
const userRole = ref('')

onMounted(() => {
  const token = localStorage.getItem('token')
  login.value = localStorage.getItem('login') || ''
  userRole.value = localStorage.getItem('userRole') || ''
  if (token) {
    logged.value = true
    loginError.value = ''
    refreshUserRole()
  } else {
    logged.value = false
    loginError.value = 'Veuillez vous connecter.'
  }
})

const refreshUserRole = async () => {
  const token = localStorage.getItem('token')
  const username = localStorage.getItem('login')
  
  if (!token || !username) return
  
  try {
    // Try to get current role from game API first
    const gameResponse = await fetch(`${API_CONFIG.GAME_BASE_URL}/resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': window.location.origin,
      },
    })
    
    if (gameResponse.ok) {
      const gameData = await gameResponse.json()
      const currentUser = gameData.find((resource: any) => resource.id === username)
      
      if (currentUser && currentUser.role) {
        const newRole = currentUser.role
        if (newRole !== userRole.value) {
          userRole.value = newRole
          localStorage.setItem('userRole', newRole)
          console.log('User role updated to:', newRole)
        }
      }
    }
  } catch (error) {
    console.warn('Could not refresh user role:', error)
  }
}

const handleLoginSuccess = (token: string) => {
  logged.value = true
  loginError.value = ''
  userRole.value = localStorage.getItem('userRole') || ''
  login.value = localStorage.getItem('login') || ''
}

const handleLoginError = (error: string) => {
  loginError.value = error
}

const logout = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.ok) {
    } else {
      console.error('Déconnexion échouée')
    }
  } catch (error) {
    console.error('Erreur pendant la déconnexion:', error)
  } finally {
    logged.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('login')
    localStorage.removeItem('userRole')
    loginError.value = ''
    login.value = ''
    userRole.value = ''
  }
}

defineExpose({ refreshUserRole })
</script>

<template>
  <div v-if="logged" class="app-container">
    <header class="main-header">
      <div class="header-content">
        <h1>Panique au Musée</h1>
        <div class="user-info">
          <span class="welcome-text">Bienvenue {{ login }}!</span>
          <span class="role-badge" :class="userRole.toLowerCase()">{{ userRole }}</span>
        </div>
      </div>
    </header>

    <nav class="main-nav">
      <RouterLink to="/" class="nav-link">🏠 Accueil</RouterLink>
      <RouterLink to="/map" class="nav-link primary">🗺️ Carte</RouterLink>
      <RouterLink to="/profile" class="nav-link">👤 Profil</RouterLink>
      <RouterLink to="/about" class="nav-link">ℹ️ À propos</RouterLink>
      <button @click="logout" class="logout-btn">🚪 Déconnexion</button>
    </nav>

    <main class="main-content">
      <RouterView :userRole="userRole"/>
    </main>
  </div>

  <div v-else class="login-container">
    <header class="login-header">
      <h1>Panique au Musée</h1>
      <p class="subtitle">Système de sécurité confidentiel</p>
    </header>
    
    <section class="login-section">
      <h2>Authentification</h2>
      <div class="content">
        <Login
          :message="loginError ? loginError : 'Connectez-vous pour continuer'"
          @login-success="handleLoginSuccess"
          @login-error="handleLoginError"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}

.main-header {
  background-color: var(--secondary-bg);
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
  padding: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content h1 {
  margin: 0;
  font-size: 2.5em;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.welcome-text {
  font-family: 'Forum', serif;
  font-size: 1.2em;
  color: var(--accent-color);
}

.role-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9em;
  text-transform: uppercase;
}

.role-badge.voleur {
  background-color: #e74c3c;
  color: white;
}

.role-badge.policier {
  background-color: #3498db;
  color: white;
}

.main-nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.nav-link {
  padding: 0.8rem 1.5rem;
  border-radius: var(--button-radius);
  background-color: var(--secondary-bg);
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background-color: var(--accent-color);
  color: var(--text-secondary);
  transform: translateY(-2px);
}

.nav-link.router-link-exact-active {
  background-color: var(--accent-color);
  color: var(--text-secondary);
}

.nav-link.primary {
  background-color: var(--accent-color);
  color: var(--text-secondary);
  font-weight: bold;
}

.logout-btn {
  margin-left: auto;
  background-color: #e74c3c !important;
  color: white !important;
  border-color: #c0392b !important;
}

.logout-btn:hover {
  background-color: #c0392b !important;
}

.main-content {
  flex: 1;
}

.login-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--accent-color);
  font-size: 1.2em;
  font-family: 'Forum', serif;
  margin-bottom: 1rem;
}

.login-section {
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .user-info {
    align-items: center;
  }

  .main-nav {
    flex-direction: column;
  }

  .logout-btn {
    margin-left: 0;
    width: 100%;
  }
}
</style>