<template>
  <div class="login">
    <h1>Login Page</h1>
    <Login
      :message="loginMessage"
      @login-success="handleLoginSuccess"
      @login-error="handleLoginError"
    />
  </div>
</template>

<script lang="ts">
import Login from '@/components/Login.vue'
import { ref } from 'vue'

export default {
  name: 'LoginView',
  components: {
    Login,
  },
  setup() {
    const loginMessage = ref('Please login to continue')
    const handleLoginSuccess = (token: string) => {
    }

    const handleLoginError = (error: string) => {
      loginMessage.value = error
    }

    return {
      loginMessage,
      handleLoginSuccess,
      handleLoginError,
    }
  },
}
</script>

<style>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
