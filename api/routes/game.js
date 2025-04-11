import express from "express";
import DAO from "../dao/gameDao.js";  // Import du DAO pour la gestion des ressources et de la ZRR

const router = express.Router();

// 1. Modifier la position d'une ressource (joueur)
router.put("/resource/:id/position", (req, res) => {
	const { id } = req.params;
	const { latitude, longitude } = req.body;

	if (latitude === undefined || longitude === undefined) {
		return res.status(400).json({ error: "Latitude et longitude requises" });
	}

	const result = DAO.updateResourcePosition(id, latitude, longitude);
	return result.error ? res.status(400).json(result) : res.json(result);
});

// 2. Récupérer la liste des ressources (pour un joueur)
router.get("/resources", (req, res) => {
	const resources = DAO.getResourcesForUser(req.user.role);
	return res.json(resources);
});

// 3. Traiter une vitrine
router.post("/treat-vitrine", (req, res) => {
	const userId = req.user.sub; // ou `.id` selon le JWT A REVOIR CAR PAS d'id dans le JWT MAIS VOIR CREATION DANS LE DAO
	const result = DAO.treatVitrine(userId);
	return result.error ? res.status(400).json(result) : res.json(result);
});

// 4. Route pour capturer un voleur
router.post('/capture-voleur', (req, res) => {
	const userId = req.user.sub; // L'ID de l'utilisateur dans le JWT A REVOIR CAR PAS d'id dans le JWT MAIS VOIR CREATION DANS LE DAO
	const result = DAO.captureVoleur(userId);
	return result.error ? res.status(400).json(result) : res.json(result);
});

// 5. Récupérer les limites de la ZRR
router.get("/zrr", (req, res) => {
	const result = DAO.getZRR();
	return result.error ? res.status(404).json(result) : res.json(result);
});


export default router;  // Export du routeur pour l'importer dans server.js
