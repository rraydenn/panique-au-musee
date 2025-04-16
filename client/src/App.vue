<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import Login from './components/Login.vue'

const logged = ref(false)
const loginError = ref('')

const handleLogin = async () => {
  const loginInput = document.getElementById('login') as HTMLInputElement
  const passwordInput = document.getElementById('password') as HTMLInputElement

  if (!loginInput || !passwordInput) {
    loginError.value = 'Veuillez renseigner votre login et mot de passe.'
    return
  }

  try {
    console.log('Sending login request...')
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      body: JSON.stringify({
        login: loginInput.value,
        password: passwordInput.value,
      }),
    })
    console.log('Response status:', response.status)

    if (response.ok) {
      const authHeader = response.headers.get('authorization')
      if(authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        localStorage.setItem('token', token)
        console.log('Token:', token)
        logged.value = true
        loginError.value = ''
      }
    } else {
      loginError.value = "Nom d'utilisateur ou mot de passe incorrect."
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    loginError.value = 'Une erreur est survenue lors de la connexion.'
  }
}
</script>

<template>
  <div v-if="logged">
    <header>
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

      <div class="wrapper">
        <HelloWorld msg="Bienvenue ! Vous êtes connecté." />

        <nav>
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>

  <div v-else>
    <header>
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
      <div class="wrapper">
        <HelloWorld msg="Veuillez vous connecter pour accéder à l'application." />
      </div>
    </header>
    <Login
      :message="loginError ? loginError : 'Connectez-vous pour continuer'"
      @loginEvent="handleLogin"
    />
  </div>
    <!--TODO : enlever quand la connexion fonctionne-->
  <button @click="logged = !logged">Toggle login</button>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
