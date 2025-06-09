import { apiPath } from './config';

// Fonction pour mettre fin à la partie
export function endGame() {
    const token = localStorage.getItem('adminToken');
    
    fetch(`${apiPath}/admin/end-game`, {
        method: 'POST',
        headers: {
            'Authorization': `${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la fin de partie');
        }
        return response.json();
    })
    .then(data => {
        // Créer un popup pour afficher les statistiques
        displayGameEndStats(data.stats);
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la fin de partie: ' + error.message);
    });
}

// Fonction pour afficher les statistiques de fin de partie dans un popup
function displayGameEndStats(stats: any) {
    // Créer un élément de fond sombre pour le popup
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    
    // Créer le popup
    const popup = document.createElement('div');
    popup.style.backgroundColor = '#3C473F';
    popup.style.padding = '30px';
    popup.style.borderRadius = '10px';
    popup.style.maxWidth = '500px';
    popup.style.width = '80%';
    popup.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    popup.style.position = 'relative';
    
    // Date formatée
    const date = new Date(stats.timestamp).toLocaleString();
    
    // Contenu du popup
    popup.innerHTML = `
        <h2 style="color: darkslategrey; margin-top: 0;">Fin de la partie</h2>
        <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <p>La partie est terminée avec succès !</p>
        </div>
        <h3 style="color: silver;">Statistiques</h3>
        <div style="display: grid; grid-template-columns: auto auto; gap: 10px; margin-bottom: 20px;">
            <div style="font-weight: bold;">Voleurs capturés:</div>
            <div>${stats.voleursCaptured}/${stats.totalVoleurs}</div>
            <div style="font-weight: bold;">Nombre de policiers:</div>
            <div>${stats.policierCount}</div>
            <div style="font-weight: bold;">Vitrines créées:</div>
            <div>${stats.totalVitrines}</div>
            <div style="font-weight: bold;">Date de fin:</div>
            <div>${date}</div>
        </div>
        <button id="closeStatsPopup" style=" color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; float: right;">Fermer</button>
        <div style="clear: both;"></div>
    `;
    
    // Ajouter le popup à l'overlay
    overlay.appendChild(popup);
    
    // Ajouter l'overlay au document
    document.body.appendChild(overlay);
    
    // Ajouter un gestionnaire d'événement pour fermer le popup
    document.getElementById('closeStatsPopup').addEventListener('click', function() {
        document.body.removeChild(overlay);
        // Rafraîchir la page pour réinitialiser l'affichage après la fin de la partie
        window.location.reload();
    });
}
