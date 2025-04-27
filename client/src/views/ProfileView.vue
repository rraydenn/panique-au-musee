<template>
    <div class="profile">
        <h1> User Profile </h1>
        <ProfileUpdate />
    </div>
</template>

<script setup lang="ts">
import ProfileUpdate from '@/components/ProfileUpdate.vue';
</script>

<style scoped>
.profile {
    padding: 1rem;
}
</style>