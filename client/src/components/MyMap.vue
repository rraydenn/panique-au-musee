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
//import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";

// initialisation de la map
let lat = 45.782,
  lng = 4.8656
const zoom = 19
let mymap = {}

export default {
  name: 'MyMap',
  methods: {
    // Procédure de mise à jour de la map
    updateMap: function () {
      // Affichage à la nouvelle position
      mymap.setView([lat, lng], zoom)

      // La fonction de validation du formulaire renvoie false pour bloquer le rechargement de la page.
      return false
    },
  },
  async beforeMount() {
    // HERE is where to load Leaflet components!
    const L = await import('leaflet')
    // Procédure d'initialisation
    mymap = L.map('map', {
      center: [lat, lng],
      zoom: zoom,
    })
    //updateMap();

    // Création d'un "tile layer" (permet l'affichage sur la carte)
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
        accessToken:
          'pk.eyJ1IjoieGFkZXMxMDExNCIsImEiOiJjbGZoZTFvbTYwM29sM3ByMGo3Z3Mya3dhIn0.df9VnZ0zo7sdcqGNbfrAzQ',
      },
    ).addTo(mymap)

    // Ajout d'un marker
    L.marker([45.78207, 4.86559])
      .addTo(mymap)
      .bindPopup('Entrée du bâtiment<br><strong>Nautibus</strong>.')
      .openPopup()

    // Clic sur la carte
    mymap.on('click', (e) => {
      lat = e.latlng.lat
      lng = e.latlng.lng
      this.updateMap()
    })
  },
}
</script>

<style scoped>
.map {
  height: 400px;
  width: 100%;
  border: 1px solid;
}
</style>
