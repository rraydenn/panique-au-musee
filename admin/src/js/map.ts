import * as L from 'leaflet';
import { updateLatValue, updateLonValue, updateZoomValue, updateMap as updateMapState } from './mapState';

// initialisation de la map
const lat : number = 45.782;
const lng : number = 4.8656;
const zoom : number = 19;

let mymap = L.map('map', {
    center: [lat, lng],
    zoom: zoom
});

// Initialisation de la map
function initMap(): L.Map {
    // Création d'un "tile layer" (permet l'affichage sur la carte)
    L.tileLayer('https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=pk.eyJ1IjoieGFkZXMxMDExNCIsImEiOiJjbGZoZTFvbTYwM29sM3ByMGo3Z3Mya3dhIn0.df9VnZ0zo7sdcqGNbfrAzQ', {
        maxZoom: 21,
        minZoom: 1,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
		//accessToken: 'pk.eyJ1IjoibTFpZjEzIiwiYSI6ImNqczBubmhyajFnMnY0YWx4c2FwMmRtbm4ifQ.O6W7HeTW3UvOVgjCiPrdsA'

    }).addTo(mymap);

    // Ajout d'un marker
    L.marker([45.78207, 4.86559]).addTo(mymap).bindPopup('Entrée du bâtiment<br>Nautibus.').openPopup();

    // Initialiser les valeurs du formulaire avec les valeurs de départ de la carte
    updateLatValue(mymap.getCenter().lat);
    updateLonValue(mymap.getCenter().lng);
    updateZoomValue(mymap.getZoom());

    // Clic sur la carte
    mymap.on('click', (e : L.LeafletMouseEvent) => {
        updateMapState(mymap, [e.latlng.lat, e.latlng.lng], mymap.getZoom());
        // Mise à jour des champs du formulaire
        updateLatValue(e.latlng.lat);
        updateLonValue(e.latlng.lng);
    });

    // Événement de fin de zoom
    mymap.on('zoomend', () => {
        updateZoomValue(mymap.getZoom());
    });

    // Événement de déplacement de la carte
    mymap.on('moveend', () => {
        updateLatValue(mymap.getCenter().lat);
        updateLonValue(mymap.getCenter().lng);
    });

     // Correction de bug d'affichage
    setTimeout(() => {
        mymap.invalidateSize();
    }, 100); // un léger délai garantit que le DOM a fini son rendu

    return mymap;
}

// Mise à jour de la map
function updateMap(latlng: [number, number], zoom: number): boolean {
    return updateMapState(mymap, latlng, zoom);
}

export { updateMap };
export default initMap;