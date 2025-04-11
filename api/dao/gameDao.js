import haversine from 'haversine-distance';

class DAO {
	constructor() {
		this.resources = [];  // Pour stocker les ressources (joueurs, vitrines)
		this.zrr = null;  // Limites de la ZRR
	}

	// Définir les limites de la ZRR avec deux points
	setZRR(bounds) {
		// bounds doit être un tableau avec deux objets LatLng
		if (!Array.isArray(bounds) || bounds.length !== 2 || !bounds[0].latitude || !bounds[0].longitude || !bounds[1].latitude || !bounds[1].longitude) {
			return { error: 'Les limites de la ZRR doivent être un tableau de deux objets LatLng avec latitude et longitude' };
		}
		this.zrr = {
			"limite-NO": [Math.max(bounds[0].latitude, bounds[1].latitude), Math.min(bounds[0].longitude, bounds[1].longitude)],
			"limite-NE": [Math.max(bounds[0].latitude, bounds[1].latitude), Math.max(bounds[0].longitude, bounds[1].longitude)],
			"limite-SE": [Math.min(bounds[0].latitude, bounds[1].latitude), Math.max(bounds[0].longitude, bounds[1].longitude)],
			"limite-SO": [Math.min(bounds[0].latitude, bounds[1].latitude), Math.min(bounds[0].longitude, bounds[1].longitude)]
		};
		return { success: true };
	}

	// Ajouter une ressource (joueur ou vitrine)
	addResource(resource) {
		const existingResource = this.resources.find(r => r.id === resource.id);
		if (existingResource) {
			return { error: 'Ressource déjà existante' };
		}
		this.resources.push(resource);
		return { success: true, resource };
	}

	// Modifier la position d'une ressource (joueur ou vitrine)
	updateResourcePosition(id, newLatitude, newLongitude) {
		const resource = this.resources.find(r => r.id === id);
		if (!resource) {
			return { error: 'Ressource introuvable' };
		}
		resource.position = { latitude: newLatitude, longitude: newLongitude }; // Nouvelle position
		return { success: true, resource };
	}

	// Récupérer la liste des ressources pour un joueur
	getResourcesForUser(userRole) {
		const forbiddenRole = userRole === 'VOLEUR' ? 'POLICIER' :
							  userRole === 'POLICIER' ? 'VOLEUR' : null;
	
		return this.resources.filter(r => {
			if (!r.position) return false; // On ne garde que les ressources géolocalisées
			if (r.role === forbiddenRole) return false; // On masque l'espèce opposée
	
			// Si c'est une vitrine, on la garde seulement si elle est encore active (TTL > 0)
			if (r.role === 'vitrine' && r.ttl <= 0) return false;
	
			return true;
		});
	}

	// Traiter une vitrine
	treatVitrine(userId) {
		const user = this.resources.find(r => r.id === userId && r.role !== 'vitrine');
		if (!user || !user.position) {
			return { error: "Utilisateur introuvable ou non géolocalisé" };
		}
	
		// Cherche une vitrine proche
		const nearbyVitrine = this.resources.find(r =>
			r.role === 'vitrine' &&
			r.ttl > 0 &&
			r.position &&
			haversine(user.position, r.position) < 5 // moins de 5m
		);
	
		if (!nearbyVitrine) {
			return { error: "Aucune vitrine à proximité à traiter" };
		}
	
		// Marquer la vitrine comme traitée
		nearbyVitrine.ttl = 0;
	
		// Incrémenter compteur du joueur
		user.traited = (user.traited || 0) + 1;
	
		return { success: true, vitrine: nearbyVitrine.id, treatedCount: user.traited };
	}

	// Capturer un voleur
	captureVoleur(userId) {
		const policeman = this.resources.find(r => r.id === userId && r.role === 'POLICIER');
		const thief = this.resources.find(r => r.role === 'VOLEUR' && r.position);
        
		if (!policeman || !policeman.position) {
			return { error: "Policier introuvable ou non géolocalisé" };
		}

		if (!thief || !thief.position) {
			return { error: "Voleur introuvable ou non géolocalisé" };
		}

		// Vérifier si le policier et le voleur sont à moins de 5m
		const distance = haversine(policeman.position, thief.position);
		if (distance > 5) {
			return { error: "Le voleur est trop loin pour être capturé" };
		}

		// Capture réussie, incrémenter le compteur du policier
		//policeman.capturedVoleur = (policeman.capturedVoleur || 0) + 1;

		// Optionnel : marquer le voleur comme capturé
		//thief.captured = true;

		return { success: true, capturedVoleur: thief.id};
	}

	// Récupérer les limites de la ZRR
	getZRR() {
		if (!this.zrr) {
			return { error: 'ZRR non définie' };
		}
		return { success: true, zrr: this.zrr };
	}

	// Vérifier si une position est dans la ZRR
	isPositionInZRR(latitude, longitude) {
		if (!this.zrr) {
			return false;
		}
	
		const latMin = Math.min(
			this.zrr["limite-NO"][0],
			this.zrr["limite-NE"][0],
			this.zrr["limite-SE"][0],
			this.zrr["limite-SO"][0]
		);
	
		const latMax = Math.max(
			this.zrr["limite-NO"][0],
			this.zrr["limite-NE"][0],
			this.zrr["limite-SE"][0],
			this.zrr["limite-SO"][0]
		);
	
		const lngMin = Math.min(
			this.zrr["limite-NO"][1],
			this.zrr["limite-NE"][1],
			this.zrr["limite-SE"][1],
			this.zrr["limite-SO"][1]
		);
	
		const lngMax = Math.max(
			this.zrr["limite-NO"][1],
			this.zrr["limite-NE"][1],
			this.zrr["limite-SE"][1],
			this.zrr["limite-SO"][1]
		);
	
		return latitude >= latMin && latitude <= latMax &&
			   longitude >= lngMin && longitude <= lngMax;
	}
	
}

export default new DAO();  // Export du DAO pour l'utiliser dans le serveur
