import * as L from 'leaflet';
import { apiPath } from './config';

// Form update functions
export function updateLatValue(lat: number): void {
    (document.getElementById("lat") as HTMLInputElement).value = lat.toFixed(6);
}

export function updateLonValue(lng: number): void {
    (document.getElementById("lon") as HTMLInputElement).value = lng.toFixed(6);
}

export function updateZoomValue(zoom: number): void {
    const zoomInput = document.getElementById("zoom") as HTMLInputElement;
    zoomInput.value = zoom.toString();
    
    const zoomValueElement = document.getElementById('zoomValue');
    if (zoomValueElement) {
        zoomValueElement.textContent = ` (${zoom})`;
    }
}

// Map update functions
export function updateMap(map: any, latlng: [number, number], zoom: number): boolean {
    // Affichage à la nouvelle position
    map.setView(latlng, zoom);
    return false;
}

// Optionally, add shared state if needed
export const mapState = {
    map: null as any
};

let drawnZrr: L.Rectangle | null = null;

export function drawZrr(map: any, corner1: [number, number], corner2: [number, number]) {
    console.log("drawZrr", corner1, corner2);
    // Supprimer l'ancienne ZRR si elle existe
    if (drawnZrr) {
        map.removeLayer(drawnZrr);
    }

    const bounds = L.latLngBounds(corner1, corner2);
    drawnZrr = L.rectangle(bounds, { color: "blue", fillOpacity: 0, weight: 2}).addTo(map);
}
