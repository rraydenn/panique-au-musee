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

// État partagé pour la ZRR
let drawnZrr: L.Rectangle | null = null; // ZRR temporaire en cours de définition
let permanentZrr: L.Polygon | null = null; // ZRR permanente (déjà définie)
let isSettingZrr = false; // Indique si on est en train de définir une nouvelle ZRR

// Dessine une ZRR temporaire pendant la sélection par l'admin
export function drawZrr(map: any, corner1: [number, number], corner2: [number, number]) {
    console.log("drawZrr", corner1, corner2);
    // Supprimer l'ancienne ZRR temporaire si elle existe
    if (drawnZrr) {
        map.removeLayer(drawnZrr);
    }
    
    isSettingZrr = true;
    const bounds = L.latLngBounds(corner1, corner2);
    drawnZrr = L.rectangle(bounds, { color: "blue", fillOpacity: 0.1, weight: 2 }).addTo(map);
}

// Récupère et affiche la ZRR permanente depuis l'API
export async function fetchAndDisplayZrr(map: any) {
    try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            alert("Vous n'êtes pas authentifié. Veuillez vous connecter.");
            return;
        }
        
        const response = await fetch(`${apiPath}/game/zrr`, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Si une ZRR est définie dans l'API, l'afficher
        if (data && data.zrr) {
            displayPermanentZrr(map, data.zrr);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la ZRR:', error);
    }
}

// Affiche la ZRR permanente sur la carte
export function displayPermanentZrr(map: any, zrr: any) {
    // Supprimer l'ancienne ZRR permanente si elle existe
    if (permanentZrr) {
        map.removeLayer(permanentZrr);
    }
    
    // Ne pas supprimer la ZRR temporaire si on est en train de définir une nouvelle ZRR
    if (!isSettingZrr && drawnZrr) {
        map.removeLayer(drawnZrr);
        drawnZrr = null;
    }
    
    // Créer un polygone pour la ZRR à partir des données de l'API
    const latLngs = [
        [zrr['limite-NO'][0], zrr['limite-NO'][1]],
        [zrr['limite-NE'][0], zrr['limite-NE'][1]],
        [zrr['limite-SE'][0], zrr['limite-SE'][1]],
        [zrr['limite-SO'][0], zrr['limite-SO'][1]]
    ];
    
    permanentZrr = L.polygon(latLngs, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.1,
        weight: 2
    }).addTo(map);
}

// Réinitialiser l'état de définition de la ZRR
export function resetZrrState() {
    isSettingZrr = false;
}