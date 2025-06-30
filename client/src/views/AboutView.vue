<template>
  <section>
    <h2>ℹ️ À propos du jeu</h2>
    <div class="content">
      <div class="about-content">
        <h3>Panique au Musée</h3>
        <p>Un jeu de stratégie en temps réel où voleurs et policiers s'affrontent dans un musée.</p>
        
        <div class="game-rules">
          <h4>🎯 Objectif du jeu</h4>
          <p>Les voleurs tentent de voler les objets dans les vitrines tandis que les policiers essaient de les arrêter et de sécuriser le musée.</p>
          
          <h4>🎮 Comment jouer</h4>
          <ul>
            <li><strong>Navigation :</strong> Utilisez la carte pour vous déplacer dans le musée</li>
            <li><strong>Interaction :</strong> Approchez-vous des vitrines pour interagir</li>
            <li><strong>Géolocalisation :</strong> Votre position GPS réelle est utilisée</li>
            <li><strong>Temps réel :</strong> Le jeu se déroule en temps réel avec d'autres joueurs</li>
          </ul>
          
          <h4>⚙️ Fonctionnalités</h4>
          <ul>
            <li>Système de géolocalisation précis</li>
            <li>Calibration GPS manuelle</li>
            <li>Notifications en temps réel</li>
            <li>Interface adaptée mobile</li>
          </ul>
        </div>

        <div class="back-action">
          <RouterLink to="/" class="back-button">
            🏠 Retour à l'accueil
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.about-content {
  max-width: 800px;
  margin: 0 auto;
}

.game-rules {
  margin: 2rem 0;
}

.game-rules h4 {
  color: var(--accent-color);
  margin: 1.5rem 0 1rem 0;
  font-size: 1.3em;
}

.game-rules ul {
  list-style-type: none;
  padding: 0;
}

.game-rules li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  line-height: 1.5;
}

.game-rules li:before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--accent-color);
  font-weight: bold;
  font-size: 1.2em;
}

.back-action {
  text-align: center;
  margin-top: 2rem;
}

.back-button {
  padding: 0.8rem 1.5rem;
  background-color: var(--secondary-bg);
  color: var(--text-primary);
  text-decoration: none;
  border-radius: var(--button-radius);
  transition: all 0.3s ease;
  font-weight: 500;
}

.back-button:hover {
  background-color: var(--accent-color);
  color: var(--text-secondary);
  transform: translateY(-2px);
}
</style>