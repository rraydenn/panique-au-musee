<template>
  <h2>{{ message }}</h2>

  <label for="login">Login :&nbsp;</label>
  <input type="text" name="login" id="login" />
  <br />
  <label for="password">Password :&nbsp;</label>
  <input type="password" name="password" id="password" />
  <br />
  <button @click="$emit('loginEvent')">Send</button>
</template>

<script lang="ts">
export default {
  name: 'MyLogin',
  props: {
    message: String,
  },
  methods: {
    login: () => {
      console.log('Login cliqué.')
      //TODO qqch ici
    },
  },
  emits: ['loginEvent'],
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
