<template>
  <section class="map-section">
    <h2>🗺️ Carte de Surveillance</h2>
    <div class="content">
      <p>Surveillance en temps réel des positions et des ressources du musée.</p>
      <MyMap :userRole="userRole" />
    </div>
  </section>
</template>

<script setup lang="ts">
import MyMap from '@/components/MyMap.vue'

defineProps<{
  userRole: string
}>()
</script>

<style scoped>
.map-section {
  margin-bottom: 2rem;
}
</style>