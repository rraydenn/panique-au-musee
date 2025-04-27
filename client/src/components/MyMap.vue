<template>
  <section>
    <h2>Carte</h2>
    <p class="content">
      <strong>TODO :</strong> mettre à jour les positions des différents objets sur la carte.
    </p>
    <div id="map" class="map" ref="map"></div>
  </section>
</template>

<script lang="ts">
import 'leaflet/dist/leaflet.css'
import { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
//import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { defineComponent } from 'vue'

const mapConfig = {
  lat: 45.782,
  lng: 4.8656,
  zoom: 19,
}

const markers = [
  {
    lat: 45.78207,
    lng: 4.86559,
    popup: 'Entrée du bâtiment Nautibus',
  },
]

let mymap: LeafletMap | null = null
let leafletMarkers: LeafletMarker[] = []
let eventBound = false

export default defineComponent({
  name: 'MyMap',
  methods: {
    // Procédure de mise à jour de la map
    updateMap: function () {
      // Affichage à la nouvelle position
      if(mymap) {
        mymap.setView([mapConfig.lat, mapConfig.lng], mapConfig.zoom)
      }

      // La fonction de validation du formulaire renvoie false pour bloquer le rechargement de la page.
      return false
    },
    addMarkers() {
      if(!mymap || !window.L) {
        return
      }

      this.removeMarkers()
      
      markers.forEach(marker => {
        const m = window.L.marker([marker.lat, marker.lng])
          .addTo(mymap as LeafletMap)
        
        if(marker.popup) {
          m.bindPopup(marker.popup)
        }

        leafletMarkers.push(m)
      })
    },
    removeMarkers() {
      if(!mymap) return

      leafletMarkers.forEach(marker => {
        if(mymap) 
          mymap.removeLayer(marker)
      })

      leafletMarkers = []
    },
    async initializeMap() {
      const L = await import('leaflet')
      mymap = L.map('map', {
        center: [mapConfig.lat, mapConfig.lng],
        zoom: mapConfig.zoom,
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
      },
      ).addTo(mymap)

      mymap.on('click', (e) => {
        mapConfig.lat = e.latlng.lat
        mapConfig.lng = e.latlng.lng
        this.updateMap()
      })

      this.addMarkers()

    }
  },
  async mounted() {
    await this.initializeMap()

    if(!eventBound) {
      eventBound = true
    }
  },
  beforeUnmount() {
    this.removeMarkers()
    if(mymap) {
      mymap.remove()
      mymap = null
    }
  }
})
</script>

<style scoped>
.map {
  height: 400px;
  width: 100%;
  border: 1px solid;
}
</style>
