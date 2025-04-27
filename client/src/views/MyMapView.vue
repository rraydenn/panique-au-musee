<template>
  <div class="map-view">
    <h1>Map View</h1>
    <MyMap :userRole="userRole" />
  </div>
</template>

<script setup lang="ts">
import MyMap from '@/components/MyMap.vue'

defineProps<{
  userRole: string
}>()
</script>

<style>
.map-view {
  padding: 1rem;
}
</style>
