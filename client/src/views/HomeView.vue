<template>
  <section>
    <h2>🏛️ Accueil - Panique au Musée</h2>
    <div class="content">
      <div class="welcome-section">
        <h3>Bienvenue dans le jeu !</h3>
        <p v-if="userRole">Vous êtes connecté en tant que <strong>{{ userRole }}</strong>.</p>
        
        <div class="game-info" v-if="userRole">
          <div v-if="userRole === 'VOLEUR'" class="role-info voleur">
            <h4>🥷 Mission du Voleur</h4>
            <ul>
              <li>Volez les objets dans les vitrines ouvertes</li>
              <li>Évitez les policiers</li>
              <li>Maximisez votre score avant la fin du temps</li>
            </ul>
          </div>
          
          <div v-else-if="userRole === 'POLICIER'" class="role-info policier">
            <h4>👮 Mission du Policier</h4>
            <ul>
              <li>Sécurisez les vitrines ouvertes</li>
              <li>Capturez les voleurs</li>
              <li>Protégez le musée</li>
            </ul>
          </div>
        </div>

        <div class="quick-actions">
          <RouterLink to="/map" class="action-button primary">
            🗺️ Commencer la partie
          </RouterLink>
          <RouterLink to="/profile" class="action-button">
            👤 Mon profil
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  userRole?: string
}>()
</script>

<style scoped>
.welcome-section {
  text-align: center;
}

.game-info {
  margin: 2rem 0;
}

.role-info {
  padding: 1.5rem;
  border-radius: var(--button-radius);
  margin: 1rem 0;
  text-align: left;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.role-info.voleur {
  background-color: rgba(231, 76, 60, 0.1);
  border: 2px solid #e74c3c;
}

.role-info.policier {
  background-color: rgba(52, 152, 219, 0.1);
  border: 2px solid #3498db;
}

.role-info h4 {
  margin-bottom: 1rem;
  color: var(--accent-color);
}

.role-info ul {
  list-style-type: none;
  padding: 0;
}

.role-info li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.role-info li:before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--accent-color);
  font-weight: bold;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.action-button {
  padding: 1rem 2rem;
  border-radius: var(--button-radius);
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;
  background-color: var(--secondary-bg);
  color: var(--text-primary);
}

.action-button.primary {
  background-color: var(--accent-color);
  color: var(--text-secondary);
  font-size: 1.1em;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.action-button.primary:hover {
  background-color: #c9b388;
}

@media (max-width: 768px) {
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>