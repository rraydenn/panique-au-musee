import * as L from 'leaflet';
import { apiPath, apiSpringBootPath, refreshInterval } from './config';
import { endGame } from './endGame';

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
    captured?: boolean;
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
        this.map.on('contextmenu', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            (document.getElementById('vitrineLat') as HTMLInputElement).value = lat.toFixed(5);
            (document.getElementById('vitrineLng') as HTMLInputElement).value = lng.toFixed(5);

            e.originalEvent.preventDefault();
        });
    }

    // Démarrer le polling des ressources
    public startPolling(): void {
        if (this.pollingInterval) {
            return; // Polling déjà actif
        }
        
        // Récupérer les ressources immédiatement
        this.fetchResources();

        // Vérifier le statut du jeu pour voir si tous les voleurs sont capturés
        this.checkGameStatus();
        
        // Puis configurer le polling régulier
        this.pollingInterval = window.setInterval(() => {
            this.fetchResources();
            this.checkGameStatus();
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
            if (!data || !Array.isArray(data)) {
                console.error('Données inattendues: ', data);
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
                if (resource.image && typeof resource.image === 'string' && resource.image.trim() !== '') {
                    console.log(`Mise à jour de l'icône pour la ressource ${resource.id}`);
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
                if (resource.image && typeof resource.image === 'string' && resource.image.trim() !== '') {
                    console.log(`Création d'un nouveau marqueur pour la ressource ${resource.id}`);
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

    // Afficher les ressources dans une liste et permettre de changer le rôle des joueurs
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
            // Vérifier si c'est un joueur (POLICIER ou VOLEUR)
            const isPlayer = res.role === 'POLICIER' || res.role === 'VOLEUR';
            
            // Vérifier si c'est un voleur capturé
            const isVoleurCapture = res.role === 'VOLEUR' && res.captured === true;
            
            // Créer le contenu HTML de base pour tous les joueurs
            let playerContent = `<b> - ${res.id}</b>`;
    
            // Ajouter l'image du joueur s'il en a une
            if (res.image && typeof res.image === 'string' && res.image.trim() !== '') {
                playerContent += `<img src="${res.image}" alt="${res.id}" style="width: 30px; height: 30px; border-radius: 50%; margin-left: 10px;" />`;
            }
            
            playerContent += `<span style="margin-left: 10px;">${res.role}</span>`;
                        
            // Ajouter l'indicateur "CAPTURÉ" pour les voleurs capturés
            if (isVoleurCapture) {
                playerContent += `<span style="color: red; font-weight: bold; margin-left: 10px;">CAPTURÉ</span>`;
                li.style.color = "red";
            }
            
            li.innerHTML = playerContent;
            
            // Ajouter le bouton de changement d'espèce seulement pour les joueurs
            if (isPlayer) {
                const changeRoleBtn = document.createElement('button');
                changeRoleBtn.innerText = res.role === 'POLICIER' ? 'Changer en VOLEUR' : 'Changer en POLICIER';
                changeRoleBtn.style.marginLeft = '10px';
                changeRoleBtn.style.padding = '3px 8px';
                changeRoleBtn.style.fontSize = '12px';
                changeRoleBtn.onclick = () => {
                    const newRole = res.role === 'POLICIER' ? 'VOLEUR' : 'POLICIER';
                    this.changePlayerRole(res.id, newRole);
                };
                li.appendChild(changeRoleBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.innerText = '❌'
                deleteBtn.style.marginLeft = '5px';
                deleteBtn.style.padding = '3px 8px';
                deleteBtn.style.fontSize = '12px';
                deleteBtn.style.backgroundColor = '#dc3545';
                deleteBtn.style.color = 'white';
                deleteBtn.style.border = 'none';
                deleteBtn.style.borderRadius = '3px';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.onclick = () => {
                    if (confirm(`Êtes-vous sûr de vouloir supprimer le joueur ${res.id} ?`)) {
                        this.deletePlayer(res.id);
                    }
                };
                li.appendChild(deleteBtn);
            }
        }
        else {
            li.innerHTML = `<b> - ${res.id}</b> ${res.ttl ? `<span style="color: red;">(Expire dans ${res.ttl})</span>` : ''}`;
        }
                            
        playerList.appendChild(li);
    });
    }

    // Méthode pour changer le rôle d'un joueur
    public changePlayerRole(playerId: string, newRole: string): void {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            console.error("Pas de token d'authentification disponible");
            return;
        }

        console.log(`Changement du rôle du joueur ${playerId} en ${newRole}`);
        
        fetch(`${apiPath}/admin/resource/${playerId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            console.log(`Rôle du joueur ${playerId} changé en ${newRole}`);
            // Rafraîchir les données après le changement
            this.fetchResources();
        })
        .catch(error => {
            console.error('Erreur lors du changement de rôle:', error);
        });
    }

    public deletePlayer(playerId: string): void {
        const token = localStorage.getItem('adminToken');

        if (!token) {
            console.error("Pas de token d'authentification disponible");
            return;
        }

        //console.log(`Suppression du joueur ${playerId}`);

        fetch(`${apiPath}/admin/resource/${playerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP lors de la suppression du jeu: ${response.status}`);
            }
            //console.log(`Joueur ${playerId} supprimé du jeu`);

            return fetch(`${apiSpringBootPath}/users/${playerId}`, {
                method: 'DELETE',
                headers: {
                    'Origin': window.location.origin,
                    'Content-Type': 'application/json',
                }
            });
        })
        .then(reponse => {
            if (!reponse.ok) {
                throw new Error(`Erreur HTTP lors de la suppression de l'utilisateur: ${reponse.status}`);
            }
            //console.log(`Utilisateur ${playerId} supprimé`);
            alert(`Joueur ${playerId} supprimé avec succès !`);

            // Rafraîchir les ressources après la suppression
            this.fetchResources();
        })
        .catch(error => {
            console.error('Erreur lors de la suppression du joueur:', error);
            alert(`Erreur lors de la suppression du joueur ${playerId}: ${error.message}`);
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

    // Vérifier le statut du jeu (si tous les voleurs sont capturés)
    private checkGameStatus(): void {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
            console.error("Pas de token d'authentification disponible");
            return;
        }
        
        fetch(`${apiPath}/game/game-status`, {
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
        .then(statusData => {
            // Si tous les voleurs sont capturés, déclencher la fin de partie
            if (statusData.gameOver) {
                console.log("Tous les voleurs sont capturés - fin de partie automatique");
                this.stopPolling(); // Arrêter le polling
                endGame();
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification du statut du jeu:', error);
        });
    }

}

export default GameService;