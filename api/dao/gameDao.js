import haversine from 'haversine-distance';

class DAO {
	constructor() {
		this.resources = [];  // Pour stocker les ressources (joueurs, vitrines)
		this.zrr = null;      // Limites de la ZRR
		this.defaultTTL = 60; // Durée par défaut du TTL en secondes

		// Démarrer le timer qui décrémente le TTL toutes les secondes
		setInterval(() => {
			this.decrementTTL();
		}, 1000);
	}

	// Décrémenter le TTL de toutes les vitrines actives
	decrementTTL() {
		this.resources.forEach(resource => {
			if (resource.role === 'vitrine' && resource.ttl > 0) {
				resource.ttl = Math.max(resource.ttl - 1, 0);
			}
		});
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

	// Modifier l'image d'un joueur
	updatePlayerImage(id, image) {
		const resource = this.resources.find(r => r.id === id);
		if (!resource) {
			return { error: 'Joueur non trouvée' };
		}
		resource.image = image;
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

	// Récupérer une ressource par son ID si elle est géolocalisée à moins de 5m
	isNearby(userId, targetRole, maxDistanceMeters = 5) {		
		const user = this.resources.find(r => r.id === userId);
		if (!user) {
			return { error: "Ressource de départ introuvable ou non géolocalisée" };
		}

		const nearby = this.resources.filter(r =>
			r.id !== userId &&
			r.role === targetRole &&
			r.position &&
			(r.ttl === undefined || r.ttl > 0) &&
			haversine(user.position, r.position) <= maxDistanceMeters
		);
		
		if (nearby.length > 0) {
			return { success: true, nearby };
		} else {
			return { success: false, message: "Aucune ressource à proximité" };
		}
	}

	// Traiter une vitrine
	treatVitrine(userId, vitrineId) {  //TODO: Passer l'ID de la vitrine
		const user = this.resources.find(r => r.id === userId && r.role !== 'vitrine');
		const vitrine = this.resources.find(r => r.id === vitrineId && r.role === 'vitrine');

		if (!user || !user.position) {
			return { error: "Utilisateur introuvable ou non géolocalisé" };
		}

		if (!vitrine || !vitrine.position || vitrine.ttl <= 0) {
			return { error: "Vitrine invalide ou déjà traitée" };
		}
	
		// Vérifier la proximité
		const distance = haversine(user.position, vitrine.position);
		if (distance > 5) {
			return { error: "Vitrine trop éloignée pour être traitée" };
		}
	
		// Marquer la vitrine comme traitée
		vitrine.ttl = 0;
	
		// Incrémenter compteur du joueur
		user.showcases = (user.showcases || 0) + 1;
	
		return { success: true, vitrine: vitrine.id, treatedCount: user.showcases };
	}

	// Capturer un voleur
	captureVoleur(userId, voleurId) {
		const policeman = this.resources.find(r => r.id === userId && r.role === 'POLICIER');
		const thief = this.resources.find(r => r.id === voleurId && r.role === 'VOLEUR');

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
		policeman.terminated = (policeman.terminated || 0) + 1;

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
