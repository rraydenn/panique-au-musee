import * as L from 'leaflet';
import { apiPath, refreshInterval } from './config';

// Définition des types pour les ressources
interface Resource {
    id: string;
    position: {
        latitude: number;
        longitude: number;
    };
    role: string;
    image?: string;
    ttl?: string;
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

        // Gestion du clic sur la carte pour ajouter une vitrine
        this.map.on('click', (e: L.LeafletMouseEvent) => {
            map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                (document.getElementById('vitrineLat') as HTMLInputElement).value = lat.toFixed(5);
                (document.getElementById('vitrineLng') as HTMLInputElement).value = lng.toFixed(5);
            });
        });
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
        
        fetch(`${apiPath}/game/resources`, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,
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
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.error('Données inattendu ou vide: ', data);
                return;
            } else {
                this.updateResources(data);
            }
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
                marker.setLatLng([resource.position.latitude, resource.position.longitude]);
                if (resource.image) {
                    // Met à jour l'icône seulement si image existe
                    const resourceIcon = L.icon({
                        iconUrl: resource.image,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15],
                        popupAnchor: [0, -32]
                    });
                    marker.setIcon(resourceIcon);
                }
                marker.getPopup()?.setContent(popupContent);
            } 
            // Sinon, créer un nouveau marqueur
            else {
                let marker: L.Marker;
                if (resource.image) {
                    const resourceIcon = L.icon({
                        iconUrl: resource.image,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15],
                        popupAnchor: [0, -32]
                    });
                    marker = L.marker([resource.position.latitude, resource.position.longitude], {
                        icon: resourceIcon
                    });
                } else {
                    marker = L.marker([resource.position.latitude, resource.position.longitude]);
                }
                marker.bindPopup(popupContent).addTo(this.map);
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
        
        //console.log(`${resources.length} ressources mises à jour sur la carte`);
        // Mettre à jour la liste des joueurs
        this.updatePlayerList(resources);
    }

    private updatePlayerList(resources: Resource[]): void {
        const playerList = document.getElementById('playerList');
        if (!playerList) return;

        playerList.innerHTML = '';
        resources.forEach(res => {
            const li = document.createElement('li');
            li.style.display = "flex";
            li.style.alignItems = "center";
            li.style.gap = "0.5em";
            if (res.role != 'vitrine') {
                li.innerHTML = ` <b> - ${res.id}</b>
                                <img src="${res.image}" alt="${res.id}" style="width: 30px; height: 30px; border-radius: 50%;" />`;
            }
            else {
                li.innerHTML = `<b> - ${res.id}</b> ${res.ttl ? `<span style="color: red;">(Expire dans ${res.ttl})</span>` : ''}`;
            }
                                
            playerList.appendChild(li);
        });
    }
    
    // Créer le contenu du popup selon le type de ressource
    private createPopupContent(resource: Resource): string {
        const flattenObject = (obj: any, prefix = ''): [string, any][] => {
            return Object.entries(obj).flatMap(([key, value]) => {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'object' && value !== null) {
                    return flattenObject(value, fullKey);
                } else {
                    return [[fullKey, value]];
                }
            });
        };

        const lines = flattenObject(resource).map(
            ([key, value]) => `<b>${key}:</b> ${value}`
        );

        return lines.join('<br>');
    }

}

export default GameService;