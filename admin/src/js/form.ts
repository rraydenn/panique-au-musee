import { updateMap } from './map';
import { drawZrr, fetchAndDisplayZrr, resetZrrState} from './mapState';
import { apiPath, apiSpringBootPath } from './config';
import { endGame } from './endGame'; // Importer la fonction endGame


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
        setZrr(mymap);
    });

    (document.getElementById("sendZrrButton") as HTMLButtonElement).addEventListener("click", () => {
        sendZrr(mymap);
    });

    // Écouteur pour le bouton d'ajout de vitrine
    (document.getElementById("addVitrineButton") as HTMLButtonElement).addEventListener("click", () => {
        // Mettre à jour les champs du formulaire avec les valeurs actuelles de la vitrine
        const latInputVitrine = document.getElementById('vitrineLat') as HTMLInputElement;
        const lonInputVitrine = document.getElementById('vitrineLng') as HTMLInputElement;
        sendVitrine(latInputVitrine.value, lonInputVitrine.value);
    });

    // Écouteur pour le bouton de définition du TTL
    (document.getElementById("setTtlButton") as HTMLButtonElement).addEventListener("click", () => {
        setTtl();
    });

    // Ajouter un gestionnaire d'événement pour le bouton "End Game"
    document.getElementById('endGameButton').addEventListener('click', function() {
        if (confirm("Êtes-vous sûr de vouloir mettre fin à la partie ? Cette action est irréversible.")) {
            endGame();
        }
    });

    // Ajouter un gestionnaire d'événement pour le bouton "End Game"
    document.getElementById('resetGameButton').addEventListener('click', function() {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser la partie ? Cette action est irréversible.")) {
            resetGame();
        }
    });

    // Ajouter un utilisateur
    document.getElementById('addUserButton').addEventListener('click', function() {
        addUser();
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

function setZrr(mymap: any) {
    if (!mymap.getBounds()) {
        console.error("Bounds non définis");
        alert("Impossible de récupérer les limites de la carte");
        return;
    }
    
    // Récupérer les coins sud-ouest et nord-est des limites
    const southWest = mymap.getBounds().getSouthWest();
    const northEast = mymap.getBounds().getNorthEast();
    
    // Mettre à jour les champs du formulaire avec 6 décimales pour la précision
    (document.getElementById("lat1") as HTMLInputElement).value = southWest.lat.toFixed(6);
    (document.getElementById("lon1") as HTMLInputElement).value = southWest.lng.toFixed(6);
    (document.getElementById("lat2") as HTMLInputElement).value = northEast.lat.toFixed(6);
    (document.getElementById("lon2") as HTMLInputElement).value = northEast.lng.toFixed(6);

    drawZrr(mymap, [southWest.lat, southWest.lng], [northEast.lat, northEast.lng]);
    
    // Afficher un message de confirmation
    alert("La ZRR a été définie dans le formulaire. Cliquez sur 'Send' pour l'envoyer au serveur.");
}

function sendZrr(mymap: any): void {
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
        point1: [ lat1, lon1 ],
        point2: [ lat2, lon2 ]
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
    fetch(`${apiPath}/admin/zrr`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
        },
        body: JSON.stringify(zrrData)
    })
    .then(response => {
        // Restaurer le bouton
        sendButton.disabled = false;
        sendButton.textContent = originalText;
        
        if (response.ok) {
            alert("La ZRR a été définie avec succès !");
            fetchAndDisplayZrr(mymap);
        } else {
            resetZrrState();
            response.text().then(text => {
                console.error("Erreur serveur:", text);
                alert(`Erreur lors de la définition de la ZRR: ${response.status} ${response.statusText}`);
            }).catch(() => {
                alert("Erreur lors de la définition de la ZRR");
            });
        }
    })
    .catch(error => {
        resetZrrState();
        // Restaurer le bouton en cas d'erreur
        sendButton.disabled = false;
        sendButton.textContent = originalText;
        
        console.error("Erreur lors de l'envoi de la ZRR:", error);
        alert("Erreur de connexion au serveur");
    });
}

function sendVitrine(latInput: string, lonInput: string): void {
    // Récupérer les valeurs des champs de latitude et longitude
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    
    // Vérifier que les valeurs sont valides
    if (isNaN(lat) || isNaN(lon)) {
        alert("Veuillez entrer des coordonnées valides pour la vitrine.");
        return;
    }
    
    // Récupérer le token d'authentification
    const token = localStorage.getItem('adminToken');
    if (!token) {
        alert("Vous n'êtes pas authentifié. Veuillez vous connecter.");
        return;
    }
    
    // Afficher un indicateur de chargement
    const addButton = document.getElementById("addVitrineButton") as HTMLButtonElement;
    const originalText = addButton.textContent;
    addButton.disabled = true;
    addButton.textContent = "Envoi...";
    
    // Envoyer la requête au serveur
    fetch(`${apiPath}/admin/vitrine`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
        },
        body: JSON.stringify({ position : [lat, lon] })
    })
    .then(response => {
        // Restaurer le bouton
        addButton.disabled = false;
        addButton.textContent = originalText;
        
        if (response.ok) {
            alert("Vitrine ajoutée avec succès !");
        } else {
            response.text().then(text => {
                console.error("Erreur serveur:", text);
                alert(`Erreur lors de l'ajout de la vitrine: ${response.status} ${response.statusText}`);
            }).catch(() => {
                alert("Erreur lors de l'ajout de la vitrine");
            });
        }
    })
    .catch(error => {
        // Restaurer le bouton en cas d'erreur
        addButton.disabled = false;
        addButton.textContent = originalText;
        
        console.error('Erreur:', error);
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
    fetch(`${apiPath}/admin/ttl`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
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

function resetGame(): void {
 const token = localStorage.getItem('adminToken');
    
    fetch(`${apiPath}/admin/reset-game`, {
        method: 'POST',
        headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la réinitialisation de la partie');
        } else {
            alert("La partie a été réinitialisée avec succès !");
            window.location.reload();
        }
        return response.json();
    })
}

function addUser(): void {
    const loginInput = document.getElementById('userLogin') as HTMLInputElement;
    const passwordInput = document.getElementById('userPassword') as HTMLInputElement;
    const speciesSelect = document.getElementById('userSpecies') as HTMLSelectElement;
    const imageInput = document.getElementById('userImage') as HTMLInputElement;

    if (!loginInput || !passwordInput || !speciesSelect) {
        alert('Erreur: formulaire incomplet');
        return;
    }

    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();
    const species = speciesSelect.value;
    const image = imageInput?.value.trim() || ''; //Image par défaut

    if (!login || !password) {
        alert('Login et mot de passe sont requis');
        return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
        alert("Vous n'êtes pas authentifié. Veuillez vous connecter.");
        return;
    }

    const userData = {
        login: login,
        password: password,
        species: species
    };

    fetch(`${apiSpringBootPath}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
        },
        body: JSON.stringify(userData)
    }).then(response => {
        if (response.ok || response.status === 201) {
            return addUserToGame(login, species, image);
        } else {
            throw new Error('Erreur lors de l\'ajout de l\'utilisateur');
        }
    }).then(() => {
        alert('Utilisateur créé avec succès dans les 2 APIs');
        loginInput.value = '';
        passwordInput.value = '';
        imageInput.value = '';
    })
}

function addUserToGame(login: string, species: string, image: string) {
    const token = localStorage.getItem('adminToken')

    const gameUserData = {
        username: login,
        role: species,
        image: image
    };

    return fetch(`${apiPath}/admin/player-role`, {
        method: 'POST',
        headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameUserData)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Erreur lors de l'ajout au jeu: ${response.status}`);
        }

        return response.json();
    }).then(() => {
        console.log('Utilisateur ajouté avec succès');
    })
}

export default initListeners;