<template>
  <section>
    <!-- <p class="content">
      <strong>TODO :</strong> mettre à jour les positions des différents objets sur la carte.
    </p> -->
    <div v-if="positionStore.loading" class="position-overlay">
      <h3>Acquisition de votre position en cours...</h3>
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="positionStore.error" class="position-overlay error">
      <h3>Erreur de géolocalisation</h3>
      <p>{{ positionStore.error }}</p>
      <button @click="retryGeolocation">Réessayer</button>
    </div>

    <div v-else id="map-container" style="position: relative;">
      <div id="map" class="map" ref="map"></div>

      <div v-if="nearbyVitrine" class="vitrine-overlay">
        <h3>Vitrine Trouvée!</h3>
        <p>Vous êtes à proximité d'une vitrine.</p>
        <p v-if="userRole === 'voleur'">Voler cette vitrine?</p>
        <p v-else>Sécuriser cette vitrine?</p>
        <button @click="interactWithVitrine">
          {{  userRole === 'voleur' ? 'Voler' : 'Sécuriser' }}
        </button>
      </div>
      <div v-if="actionMessage" class="vitrine-overlay">
        <p>{{ actionMessage }}</p>
      </div>

      <div v-if="calibrationMode" class="calibration-overlay">
        <h3>Mode Calibration</h3>
        <p>Appuyez longuement sur votre position réelle pour calibrer.</p>
        <div class="calibration-buttons">
          <button @click="cancelCalibration">Annuler</button>
          <button @click="resetCalibration">Réinitialiser</button>
        </div>
      </div>

      <button
        class="calibration-toggle"
        @click="toggleCalibrationMode"
        :class="{ active: calibrationMode }"
      >
        <span v-if="positionStore.isCalibrated" class="calibrated-indicator"></span>
        <span>Calibrer GPS</span>
      </button>
    </div>

    <div class="game-stats">
      <p>Role: {{ userRole }}</p>
      <p>Score: {{ gameService.localPlayer.score }}</p>
      <p>Vitrines actives: {{ activeVitrinesCount }}</p>
    </div>
  </section>
</template>

<script lang="ts">
import 'leaflet/dist/leaflet.css'
import { Map as LeafletMap, Marker, Polygon, Icon, DivIcon, LatLng } from 'leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import gameService from '@/services/game'
import { usePositionStore } from '@/stores/position'

let mymap: LeafletMap | null = null
let markers: Record<string, Marker> = {}
let zrrPolygon: Polygon | null = null
const activeVitrinesCount = ref<number | null>(null)

export default defineComponent({
  name: 'MyMap',
  props: {
    userRole: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const mapElement = ref<HTMLElement | null>(null)
    const nearbyVitrine = ref<string | null>(null)
    const actionMessage = ref<string | null>(null)
    const positionStore = usePositionStore()
    const calibrationMode = ref(false)
    const longPressTimeout = ref<number | null>(null)

    const retryGeolocation = () => {
      positionStore.startTracking()
    }
    
    const updateActiveVitrinesCount = () => {
      activeVitrinesCount.value = gameService.vitrines.length || 0
    }

    const toggleCalibrationMode = () => {
      calibrationMode.value = !calibrationMode.value
      if (calibrationMode.value) {
        actionMessage.value = "Mode calibration activé. Appuyez longuement sur votre position réelle."
        setTimeout(() => {
          actionMessage.value = null
        }, 3000)
      }
    }

    const cancelCalibration = () => {
      calibrationMode.value = false
    }

    const resetCalibration = () => {
      positionStore.resetCalibration()
      calibrationMode.value = false
      actionMessage.value = "Calibration réinitialisée."
      setTimeout(() => {
        actionMessage.value = null
      }, 2000)
    }

    const handleLongPress = (event: LeafletMouseEvent) => {
      if (!calibrationMode.value) return
      
      const referencePoint = {
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
      }

      positionStore.calibrate(referencePoint)

      actionMessage.value = "Position calibrée avec succès !"

      calibrationMode.value = false

      setTimeout(() => {
        actionMessage.value = null
      }, 2000)
    }

    const setupMapPressEvents = () => {
      if (!mymap) return

      mymap.on('mousedown', (event: LeafletMouseEvent) => {
        if (!calibrationMode.value) return

        longPressTimeout.value = window.setTimeout(() => {
          handleLongPress(event)
        }, 1000)
      })

      mymap.on('mouseup', () => {
        if (longPressTimeout.value) {
          clearTimeout(longPressTimeout.value)
          longPressTimeout.value = null
        }
      })

      mymap.on('mousemove', () => {
        if (longPressTimeout.value) {
          clearTimeout(longPressTimeout.value)
          longPressTimeout.value = null
        }
      })
    }
    
    const updateMap = () => {
      if (!mymap) return
      
      // Update player markers
      updatePlayerMarkers()
      
      // Update vitrine markers
      updateVitrineMarkers()
      
      // Update ZRR polygon
      updateZRRPolygon()
    }
    
    const updatePlayerMarkers = () => {
      // Remove old markers
      Object.values(markers)
        .filter(m => m.getElement()?.classList.contains('player-marker'))
        .forEach(m => mymap?.removeLayer(m))
      
      // Add local player marker
      const localPlayerPos = new LatLng(
        gameService.localPlayer.position.latitude,
        gameService.localPlayer.position.longitude
      )
      
      const localPlayerIcon = new DivIcon({
        className: 'player-marker local-player',
        html: `
        <div class="marker-content avatar-wrapper">
          ${
            gameService.localPlayer.image
              ? `<img src="${gameService.localPlayer.image}" alt="${gameService.localPlayer.username}" class="marker-avatar" />`
              : `<span>${gameService.localPlayer.username}</span>`
          }
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
      
      const localPlayerMarker = new Marker(localPlayerPos, { icon: localPlayerIcon })
        .addTo(mymap!)
      
      markers[gameService.localPlayer.id] = localPlayerMarker
      
      // Add other players of same role
      gameService.players
        .filter(p => p.role === props.userRole)
        .forEach(player => {
          const pos = new LatLng(player.position.latitude, player.position.longitude)
          const icon = new DivIcon({
            className: `player-marker player-${player.role}`,
            // html: `<div class="marker-content"><span>${player.username}</span></div>`,
            html: `
            <div class="marker-content avatar-wrapper">
              ${
                player.image
                  ? `<img src="${player.image}" alt="${player.username}" class="marker-avatar" />`
                  : `<span>${player.username}</span>`
              }
            </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
          
          const marker = new Marker(pos, { icon })
            .addTo(mymap!)
          
          markers[player.id] = marker
        })
    }
    
    const updateVitrineMarkers = () => {
      // Remove old vitrine markers
      Object.values(markers)
        .filter(m => m.getElement()?.classList.contains('vitrine-marker'))
        .forEach(m => mymap?.removeLayer(m))

      // On construit la position du joueur
      const userPos = new LatLng(
        gameService.localPlayer.position.latitude,
        gameService.localPlayer.position.longitude
      )
      
      // Add vitrine markers
      gameService.vitrines.forEach(vitrine => {
        const pos = new LatLng(vitrine.position.latitude, vitrine.position.longitude)
        
        // Different styles based on vitrine status
        let className = 'vitrine-marker'
        let html = ''
        
        if (vitrine.status === 'open') {
          className += ' vitrine-open'
          const distance = userPos.distanceTo(pos)
          html = `<div class="marker-content"><span>TTL: ${vitrine.ttl}s</span></div>`
          html = `<div class="marker-content">
            <span>${vitrine.ttl}s</span><br>
            <span><b>${Math.round(distance)}m</b></span>
          </div>`
        } else if (vitrine.status === 'looted') {
          className += ' vitrine-looted'
          html = `<div class="marker-content"><span>Looted</span></div>`
        } else {
          className += ' vitrine-closed'
          html = `<div class="marker-content"><span>Secured</span></div>`
        }
        
        const icon = new DivIcon({
          className,
          html,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        })
        
        const marker = new Marker(pos, { icon }).addTo(mymap!)
        markers[vitrine.id] = marker
      })
    }
    
    const updateZRRPolygon = () => {
      // Remove old ZRR polygon
      if (zrrPolygon && mymap) {
        mymap.removeLayer(zrrPolygon)
        zrrPolygon = null
      }
      
      // Add ZRR polygon if available
      if (gameService.zrr.value) {
        const { bounds } = gameService.zrr.value
        const latLngs = [
          new LatLng(bounds[0].latitude, bounds[0].longitude),
          new LatLng(bounds[0].latitude, bounds[1].longitude),
          new LatLng(bounds[1].latitude, bounds[1].longitude),
          new LatLng(bounds[1].latitude, bounds[0].longitude)
        ]
        
        zrrPolygon = new Polygon(latLngs, {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(mymap!)
        
        // Fit map to ZRR bounds
        //mymap?.fitBounds(new LatLngBounds(latLngs))
      }
    }
    
    const interactWithVitrine = async () => {
      if (nearbyVitrine.value) {
        await gameService.interactWithVitrine(nearbyVitrine.value)
        nearbyVitrine.value = null
        updateMap()

        // Message d'action
        actionMessage.value = `Bravo ! Score : ${(gameService.localPlayer?.score ?? 0) + 1}`
        setTimeout(() => {
          actionMessage.value = null
        }, 2000)
      }
    }
    
    const checkVitrineProximity = () => {
      const result = gameService.checkVitrineProximity()
      nearbyVitrine.value = typeof result === 'string' ? result : null
    }
    
    onMounted(async () => {
      positionStore.startTracking()

      watch(() => positionStore.position, async (currentPosition) => {
        if (currentPosition) {
          // Initialize Leaflet map
          await initializeMap()

          setupMapPressEvents()
          
          // Initialize game data with mock user ID
          const userId = localStorage.getItem('login') || 'user-123'
          
          gameService.localPlayer.position = {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude
          }

          await gameService.init(userId, props.userRole)
          
          // Update map with initial game data
          updateMap()
          await gameService.fetchResources()
          updateActiveVitrinesCount()

          // Mise à jour locale du TTL toutes les 1s
          const ttlInterval = setInterval(() => {
            gameService.decreaseTTL()
            updateMap()
          }, 1000)
          
          // Set interval to update map regularly
          const updateInterval = setInterval(async () => {
            await gameService.fetchResources()
            updateMap()
            updateActiveVitrinesCount()
            checkVitrineProximity()
          }, 5000)

        }
      }, { immediate: true })

      
      
      // Cleanup on unmount
      onBeforeUnmount(() => {
        positionStore.stopTracking()
        gameService.cleanup()
        if (mymap) {
          mymap.remove()
          mymap = null
        }
        if (longPressTimeout.value) {
          clearTimeout(longPressTimeout.value)
          longPressTimeout.value = null
        }
      })
    })
    
    async function initializeMap() {
      if (mymap) {
        mymap.remove()
        markers = {}
        zrrPolygon = null
      }
      
      // Get map element
      mapElement.value = document.getElementById('map')
      if (!mapElement.value) return
      
      const L = await import('leaflet')
      mymap = L.map('map', {
        center: [45.78200, 4.86550], // Lyon coordinates
        zoom: 18
      })
      
      L.tileLayer(
        'https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=pk.eyJ1IjoieGFkZXMxMDExNCIsImEiOiJjbGZoZTFvbTYwM29sM3ByMGo3Z3Mya3dhIn0.df9VnZ0zo7sdcqGNbfrAzQ',
        {
          maxZoom: 22,
          minZoom: 1,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
        }
      ).addTo(mymap)
    }
    
    return {
      mapElement,
      nearbyVitrine,
      actionMessage,
      activeVitrinesCount,
      gameService,
      positionStore,
      retryGeolocation,
      interactWithVitrine,
      calibrationMode,
      toggleCalibrationMode,
      cancelCalibration,
      resetCalibration
    }
  }
})
</script>

<style scoped>
.map {
  height: 500px;
  width: 100%;
  border: 1px solid var(--color-border);
  position: relative;
  z-index: 1;
}

.vitrine-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  z-index: 10;
  text-align: center;
  color: #2c3e50;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.game-stats {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #2c3e50;
}

/* Add these styles to your global CSS since Leaflet creates elements outside Vue components */
:global(.player-marker) {
  background-color: #2c3e50;
  border-radius: 50%;
  color: white;
  text-align: center;
  font-weight: bold;
}

:global(.local-player) {
  background-color: #41b883 !important;
  z-index: 1000;
}

:global(.player-voleur) {
  background-color: #e74c3c;
}

:global(.player-policier) {
  background-color: #3498db;
}

:global(.vitrine-marker) {
  border-radius: 50%;
  color: white;
  text-align: center;
  font-weight: bold;
}

:global(.vitrine-open) {
  background-color: #f1c40f;
}

:global(.vitrine-looted) {
  background-color: #e74c3c;
}

:global(.vitrine-closed) {
  background-color: #3498db;
}

:global(.marker-content) {
  padding: 2px 5px;
  font-size: 12px;
  color: black;
}

:global(.avatar-wrapper) {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}


:global(.marker-avatar) {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.position-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--color-border);
  padding: 20px;
  text-align: center;
}

.position-overlay.error {
  background-color: rgba(255, 220, 220, 0.9);
}

.calibration-overlay {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  text-align: center;
}

.calibration-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 10px;
}

.calibration-toggle {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 5px;
}

.calibration-toggle.active {
  background-color: #e0f7fa;
  border-color: #4fc3f7;
}

.calibrated-indicator {
  color: green;
  font-weight: bold;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s ease infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

</style>