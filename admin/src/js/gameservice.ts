import * as L from 'leaflet';
import { apiPath, refreshInterval } from './config';

// Définition des types pour les ressources
interface Resource {
    id: string;
    position: {
        lat: number;
        lon: number;
    };
    type: string;
    // Autres propriétés potentielles des ressources
}

// Classe pour gérer la communication avec l'API et l'affichage des ressources
class GameService {
    private map: L.Map;
    private resourceMarkers: Map<string, L.Marker> = new Map();
    private pollingInterval: number | null = null;
    private pollingDelay: number = refreshInterval; // 5 secondes par défaut
    
    constructor(map: L.Map) {
        this.map = map;
    }

    // Démarrer le polling des ressources
    public startPolling(): void {
        if (this.pollingInterval) {
            return; // Polling déjà actif
        }
        
        // Récupérer les ressources immédiatement
        this.fetchResources();
        
        // Puis configurer le polling régulier
        this.pollingInterval = window.setInterval(() => {
            this.fetchResources();
        }, this.pollingDelay);
        
        console.log(`Polling démarré (intervalle: ${this.pollingDelay}ms)`);
    }
    
    // Arrêter le polling
    public stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('Polling arrêté');
        }
    }
    
    // Modifier la fréquence de polling
    public setPollingDelay(delay: number): void {
        this.pollingDelay = delay;
        if (this.pollingInterval) {
            this.stopPolling();
            this.startPolling();
        }
    }
    
    // Récupérer les ressources depuis l'API
    private fetchResources(): void {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            console.error("Pas de token d'authentification disponible");
            this.stopPolling();
            return;
        }
        
        fetch(`${apiPath}/resources`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            this.updateResources(data.resources);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des ressources:', error);
        });
    }
    
    // Mettre à jour les ressources sur la carte
    private updateResources(resources: Resource[]): void {
        // Collecter les IDs des ressources actives
        const activeResourceIds = new Set<string>();
        
        // Ajouter ou mettre à jour les marqueurs pour chaque ressource
        resources.forEach(resource => {
            activeResourceIds.add(resource.id);
            
            // Créer un contenu personnalisé selon le type de ressource
            const popupContent = this.createPopupContent(resource);
            
            // Si le marqueur existe déjà, mettre à jour sa position
            if (this.resourceMarkers.has(resource.id)) {
                const marker = this.resourceMarkers.get(resource.id)!;
                marker.setLatLng([resource.position.lat, resource.position.lon]);
                marker.getPopup()?.setContent(popupContent);
            } 
            // Sinon, créer un nouveau marqueur
            else {
                const marker = L.marker([resource.position.lat, resource.position.lon])
                    .bindPopup(popupContent)
                    .addTo(this.map);
                
                this.resourceMarkers.set(resource.id, marker);
            }
        });
        
        // Supprimer les marqueurs des ressources qui n'existent plus
        this.resourceMarkers.forEach((marker, id) => {
            if (!activeResourceIds.has(id)) {
                marker.remove();
                this.resourceMarkers.delete(id);
            }
        });
        
        console.log(`${resources.length} ressources mises à jour sur la carte`);
    }
    
    // Créer le contenu du popup selon le type de ressource
    private createPopupContent(resource: Resource): string {
        // Personnaliser selon le type de ressource
        switch (resource.type) {
            case 'ARTIFACT':
                return `<b>Artefact</b><br>ID: ${resource.id}`;
            case 'PLAYER':
                return `<b>Joueur</b><br>ID: ${resource.id}`;
            default:
                return `<b>${resource.type}</b><br>ID: ${resource.id}`;
        }
    }
}

export default GameService;