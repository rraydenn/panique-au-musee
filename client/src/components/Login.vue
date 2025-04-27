<template>
  <h2>{{ message }}</h2>

  <label for="login">Login :&nbsp;</label>
  <input type="text" name="login" id="login" v-model="loginValue" />
  <br />
  <label for="password">Password :&nbsp;</label>
  <input type="password" name="password" id="password" v-model="passwordValue" />
  <br />
  <button @click="login">Send</button>
</template>

<script lang="ts">
import { ref } from 'vue'

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
        console.log('Envoi de la requête de login...')
        const response = await fetch('/api/login', {
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
        console.log('Statut de la réponse (login):', response.status)

        if (response.ok) {
          const authHeader = response.headers.get('authorization')
          if(authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            localStorage.setItem('token', token)
            console.log('Token:', token)
            localStorage.setItem('login', loginValue.value)
            emit('login-success', token)
          }
        } else {
          emit('login-error', "Nom d'utilisateur ou mot de passe incorrect.")
        }

        const getResponse = await fetch(`/api/users/${loginValue.value}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
          }
        });

        console.log('Statut de la réponse (get):', getResponse.status)
        if (getResponse.ok) {
          const userData = await getResponse.json()
          console.log('Données utilisateur:', userData)
          console.log('Rôle utilisateur:', userData.species)
          localStorage.setItem('userRole', userData.species || 'unknown')
        } else {
          console.error('Erreur lors de la récupération des données utilisateur')
        }
      } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        emit('login-error', 'Une erreur est survenue lors de la connexion.')
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
input,
input[type='submit'],
select {
  color: grey;
  border: 1px solid;
}
</style>