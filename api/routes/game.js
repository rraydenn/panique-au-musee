import express from "express";
import DAO from "../dao/gameDao.js";  // Import du DAO pour la gestion des ressources et de la ZRR

const router = express.Router();

// 1. Ajouter ou modifier une ressource
router.post("/resource", (req, res) => {
	const { id, role, latitude, longitude } = req.body;
	if (!id || !role || latitude === undefined || longitude === undefined) {
		return res.status(400).json({ error: "ID, rôle, latitude et longitude sont requis" });
	}

	const result = DAO.addResource({ id, role, position: { latitude, longitude } });
	return result.error ? res.status(400).json(result) : res.json(result);
});

// 2. Modifier la position d'une ressource (joueur)
router.put("/resource/:id/position", (req, res) => {
	const { id } = req.params;
	const { latitude, longitude } = req.body;

	if (latitude === undefined || longitude === undefined) {
		return res.status(400).json({ error: "Latitude et longitude requises" });
	}

	const result = DAO.updateResourcePosition(id, latitude, longitude);
	return result.error ? res.status(400).json(result) : res.json(result);
});

// 3. Récupérer la liste des ressources (pour un joueur)
router.get("/resources", (req, res) => {
	const resources = DAO.getResourcesForUser(req.user.role);
	return res.json(resources);
});

// 4. Récupérer les limites de la ZRR
router.get("/zrr", (req, res) => {
	const result = DAO.getZRR();
	return result.error ? res.status(404).json(result) : res.json(result);
});

// 5. Définir les limites de la ZRR (réservé à l'administrateur)
router.post("/zrr", (req, res) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ error: "Seul un administrateur peut définir la ZRR" });
	}

	const { bounds } = req.body;

	// bounds doit être un tableau avec deux objets LatLng
	if (!Array.isArray(bounds) || bounds.length !== 2 || !bounds[0].latitude || !bounds[0].longitude || !bounds[1].latitude || !bounds[1].longitude) {
		return res.status(400).json({ error: "Les limites de la ZRR doivent être un tableau de deux objets LatLng" });
	}

	const result = DAO.setZRR(bounds);
	return result.error ? res.status(400).json(result) : res.json(result);
});

export default router;  // Export du routeur pour l'importer dans server.js
