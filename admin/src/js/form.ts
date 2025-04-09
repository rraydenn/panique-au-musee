import { updateMap } from './map';
import { apiPath } from './config';
import { updateLatValue, updateLonValue, updateZoomValue } from './mapState';

// Initialisation des écouteurs d'événements
function initListeners(mymap: any): void {
    // Écouteurs pour les champs de latitude et longitude
    const latInput = document.getElementById('lat') as HTMLInputElement;
    const lonInput = document.getElementById('lon') as HTMLInputElement;
    const zoomInput = document.getElementById('zoom') as HTMLInputElement;

    // Mise à jour de la carte quand les valeurs du formulaire changent
    latInput.addEventListener('change', () => {
        updateMapFromForm(mymap);
    });

    lonInput.addEventListener('change', () => {
        updateMapFromForm(mymap);
    });

    zoomInput.addEventListener('input', () => {
        // Mettre à jour l'indicateur de zoom
        updateZoomIndicator(parseInt(zoomInput.value));
        // Mettre à jour la carte
        updateMapFromForm(mymap);
    });

    // Initialiser l'indicateur de zoom
    updateZoomIndicator(mymap.getZoom());

    // Écouteurs pour les boutons de la ZRR
    (document.getElementById("setZrrButton") as HTMLButtonElement).addEventListener("click", () => {
        setZrr(mymap.getBounds());
    });

    (document.getElementById("sendZrrButton") as HTMLButtonElement).addEventListener("click", () => {
        sendZrr();
    });

    (document.getElementById("setTtlButton") as HTMLButtonElement).addEventListener("click", () => {
        setTtl();
    });
}

// Mettre à jour la carte à partir des valeurs du formulaire
function updateMapFromForm(mymap: any): void {
    const lat = parseFloat((document.getElementById('lat') as HTMLInputElement).value);
    const lng = parseFloat((document.getElementById('lon') as HTMLInputElement).value);
    const zoom = parseInt((document.getElementById('zoom') as HTMLInputElement).value);
    
    if (!isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
        updateMap([lat, lng], zoom);
    }
}

// Mettre à jour l'indicateur de niveau de zoom
function updateZoomIndicator(zoom: number): void {
    const zoomValueElement = document.getElementById('zoomValue');
    if (zoomValueElement) {
        zoomValueElement.textContent = ` (${zoom})`;
    }
}

function setZrr(bounds: any): void {
    if (!bounds) {
        console.error("Bounds non définis");
        alert("Impossible de récupérer les limites de la carte");
        return;
    }
    
    // Récupérer les coins sud-ouest et nord-est des limites
    const southWest = bounds.getSouthWest();
    const northEast = bounds.getNorthEast();
    
    // Mettre à jour les champs du formulaire avec 6 décimales pour la précision
    (document.getElementById("lat1") as HTMLInputElement).value = southWest.lat.toFixed(6);
    (document.getElementById("lon1") as HTMLInputElement).value = southWest.lng.toFixed(6);
    (document.getElementById("lat2") as HTMLInputElement).value = northEast.lat.toFixed(6);
    (document.getElementById("lon2") as HTMLInputElement).value = northEast.lng.toFixed(6);
    
    console.log("ZRR définie:", southWest, northEast);
    // Afficher un message de confirmation
    alert("La ZRR a été définie dans le formulaire. Cliquez sur 'Send' pour l'envoyer au serveur.");
}

function sendZrr(): void {
    // Récupérer les valeurs des champs du formulaire
    const lat1 = parseFloat((document.getElementById("lat1") as HTMLInputElement).value);
    const lon1 = parseFloat((document.getElementById("lon1") as HTMLInputElement).value);
    const lat2 = parseFloat((document.getElementById("lat2") as HTMLInputElement).value);
    const lon2 = parseFloat((document.getElementById("lon2") as HTMLInputElement).value);
    
    // Vérifier que toutes les valeurs sont présentes et valides
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
        alert("Veuillez d'abord définir la ZRR en utilisant le bouton 'Set'");
        return;
    }
    
    // Construire l'objet à envoyer
    const zrrData = {
        corner1: {
            lat: lat1,
            lon: lon1
        },
        corner2: {
            lat: lat2,
            lon: lon2
        }
    };
    
    // Récupérer le token d'authentification
    const token = localStorage.getItem('adminToken');
    if (!token) {
        alert("Vous n'êtes pas authentifié. Veuillez vous connecter.");
        return;
    }
    
    // Afficher un indicateur de chargement
    const sendButton = document.getElementById("sendZrrButton") as HTMLButtonElement;
    const originalText = sendButton.textContent;
    sendButton.disabled = true;
    sendButton.textContent = "Envoi...";
    
    // Envoyer la requête au serveur
    fetch(`${apiPath}/zrr`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(zrrData)
    })
    .then(response => {
        // Restaurer le bouton
        sendButton.disabled = false;
        sendButton.textContent = originalText;
        
        if (response.ok) {
            alert("La ZRR a été définie avec succès !");
        } else {
            response.text().then(text => {
                console.error("Erreur serveur:", text);
                alert(`Erreur lors de la définition de la ZRR: ${response.status} ${response.statusText}`);
            }).catch(() => {
                alert("Erreur lors de la définition de la ZRR");
            });
        }
    })
    .catch(error => {
        // Restaurer le bouton en cas d'erreur
        sendButton.disabled = false;
        sendButton.textContent = originalText;
        
        console.error("Erreur lors de l'envoi de la ZRR:", error);
        alert("Erreur de connexion au serveur");
    });
}

function setTtl(): void {
    const ttl = parseInt((document.getElementById("ttl") as HTMLInputElement).value);
    
    // Validation du TTL
    if (isNaN(ttl)) {
        alert("Veuillez entrer un TTL valide");
        return;
    }
    
    // Récupération du token depuis le localStorage
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        alert("Vous n'êtes pas authentifié.");
        return;
    }

    // Modification de l'état du bouton pendant l'envoi
    const ttlButton = document.getElementById("setTtlButton") as HTMLButtonElement;
    const originalText = ttlButton.textContent;
    ttlButton.disabled = true;
    ttlButton.textContent = "Envoi...";

    // Envoi des données au serveur Express
    fetch(`${apiPath}/ttl`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ttl })
    })
    .then(response => {
        // Restaurer le bouton
        ttlButton.disabled = false;
        ttlButton.textContent = originalText;
        
        if (response.ok) {
            alert("TTL mis à jour avec succès !");
        } else {
            response.text().then(text => {
                console.error("Erreur serveur:", text);
                alert(`Erreur lors de la mise à jour du TTL: ${response.status} ${response.statusText}`);
            }).catch(() => {
                alert("Erreur lors de la mise à jour du TTL");
            });
        }
    })
    .catch(error => {
        // Restaurer le bouton en cas d'erreur
        ttlButton.disabled = false;
        ttlButton.textContent = originalText;
        
        console.error('Erreur:', error);
        alert("Erreur de connexion au serveur");
    });
}

export default initListeners;