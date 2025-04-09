class DAO {
	constructor() {
		this.resources = [];  // Pour stocker les ressources (joueurs, vitrines)
		this.zrr = null;  // Limites de la ZRR
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

	// Récupérer toutes les ressources visibles (pas de la même espèce que l'utilisateur)
	getResourcesForUser(role) {
		return this.resources.filter(r => r.role !== role); // Filtre les ressources selon le rôle
	}

	// Définir les limites de la ZRR avec deux points
	setZRR(bounds) {
		// bounds doit être un tableau avec deux objets LatLng
		if (!Array.isArray(bounds) || bounds.length !== 2 || !bounds[0].latitude || !bounds[0].longitude || !bounds[1].latitude || !bounds[1].longitude) {
			return { error: 'Les limites de la ZRR doivent être un tableau de deux objets LatLng avec latitude et longitude' };
		}
		this.zrr = bounds;
		return { success: true };
	}

	// Récupérer les limites de la ZRR
	getZRR() {
		if (!this.zrr) {
			return { error: 'ZRR non définie' };
		}
		return { success: true, zrr: this.zrr };
	}
}

export default new DAO();  // Export du DAO pour l'utiliser dans le serveur
