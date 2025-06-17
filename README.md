# 🎮 MIF13 Geolocation Game - Panique au Musée

Application de jeu géolocalisé multi-plateforme développée dans le cadre du cours M1IF13. Le jeu oppose **policiers** et **voleurs** dans un environnement urbain avec géolocalisation en temps réel.

## 🎯 Concept du jeu

- **Voleurs** : Doivent traiter des vitrines dans une zone délimitée (ZRR) sans se faire capturer
- **Policiers** : Doivent capturer tous les voleurs pour gagner la partie, et peuvent fermer les vitrines avant que les voleurs ne les capturent
- **Zone de jeu** : Délimitée par une Zone à Risque Restreint (ZRR) configurable
- **Vitrines** : Apparaissent temporairement avec un système de TTL (Time To Live)

## 🏗️ Architecture

### Backend
- **users** - API Spring Boot pour l'authentification JWT et gestion des utilisateurs
- **api** - Serveur Express.js pour la logique de jeu et gestion des ressources

### Frontend
- **client** - Application Vue.js 3 PWA pour les joueurs avec carte interactive Leaflet
- **admin** - Interface d'administration TypeScript/Webpack pour la supervision

## 🛠️ Technologies

- **Backend** : Spring Boot, Express.js, JWT, CORS
- **Frontend** : Vue.js 3, TypeScript, Leaflet, PWA
- **Base de données** : In-memory (HashMap Java, Arrays JavaScript)
- **Tests** : Jasmine, Vitest
- **Build** : Maven, Webpack, Vite
- **CI/CD** : GitLab CI avec déploiement automatisé

## 🚀 Fonctionnalités

### Pour les joueurs
- 📍 Géolocalisation en temps réel
- 🗺️ Carte interactive avec positions des autres joueurs/objets
- 🔐 Authentification sécurisée JWT
- 📱 Application mobile PWA
- ⚡ Mises à jour temps réel

### Pour les administrateurs
- 🎛️ Interface de contrôle complète
- 🗺️ Configuration de la ZRR sur carte
- 👥 Gestion des rôles des joueurs
- 📊 Suivi des statistiques de partie
- ⏱️ Configuration du TTL des vitrines

## 📋 APIs disponibles

- **Authentification** : Login/logout, gestion des tokens
- **Jeu** : Positions, capture, traitement vitrines, statut partie
- **Administration** : Configuration ZRR, gestion joueurs, statistiques
- **Géolocalisation** : Détection de proximité, validation positions

## 🔧 Installation rapide

```bash
# Backend utilisateurs (Spring Boot)
cd users && mvn spring-boot:run

# API jeu (Express)
cd api && npm install && npm start

# Client joueurs (Vue.js)
cd client && npm install && npm run dev

# Interface admin
cd admin && npm install && npm run serve
```

## 📚 Documentation

- Collection Postman pour tester les APIs
- Spécification OpenAPI dans openapi
- Documentation détaillée par composant dans chaque README

---

*Projet académique M1IF13 - Université Claude Bernard Lyon 1*