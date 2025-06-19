import express from "express";
import DAO from "../dao/gameDao.js";  // Import du DAO pour la gestion des ressources et de la ZRR

const router = express.Router();

// 1. Modifier la position d'une ressource
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

// check if the user is nearby a target role
router.get("/isNearby", (req, res) => {
	const userId = req.user.sub;
	const { targetRole } = req.query;

	if (!targetRole) {
		return res.status(400).json({ error: "Le rôle cible est requis" });
	}

	const result = DAO.isNearby(userId, targetRole);
	return result.error ? res.status(400).json(result) : res.json(result);
});

// 3. Traiter une vitrine
router.post("/treat-vitrine", (req, res) => {
	const userId = req.user.sub;
	const { vitrineId } = req.body;
	if (!vitrineId) {
		return res.status(400).json({ error: "L'ID de la vitrine est requis" });
	}
	const result = DAO.treatVitrine(userId, vitrineId);
	return result.error ? res.status(400).json(result) : res.json(result);
});

// 4. Route pour capturer un voleur
router.post('/capture-voleur', (req, res) => {
	const userId = req.user.sub;
	const { voleurId } = req.body;
	if (!voleurId) {
		return res.status(400).json({ error: "L'ID du voleur est requis" });
	}
	const result = DAO.captureVoleur(userId, voleurId);
	return result.error ? res.status(400).json(result) : res.json(result);
});

// 5. Récupérer les limites de la ZRR
router.get("/zrr", (req, res) => {
	const result = DAO.getZRR();
	return result.error ? res.status(404).json(result) : res.json(result);
});

// 6. Changer l'image d'un joueur
router.put("/resource/:id/image", (req, res) => {
	const { id } = req.params;
	const { image } = req.body;

	if (!image || typeof image !== 'string') {
		return res.status(400).json({ error: "Image is required and must be a string" });
	}

	const result = DAO.updatePlayerImage(id, image);
	return result.error
		? res.status(404).json(result)
		: res.status(200).json(result);
});

// 7. Récupérer le statut de la partie (si tous les voleurs sont capturés)
router.get("/game-status", (req, res) => {
	const isGameOver = DAO.isGameOver();
	return res.json({ 
		gameOver: isGameOver,
		message: isGameOver ? "Tous les voleurs ont été capturés ! Partie terminée." : "La partie est toujours en cours."
	});
});

// 8. Supprimer une ressource par son ID
router.delete("/resource/:id", (req, res) => {
	const { id } = req.params;
    
	if (!id) {
		return res.status(400).json({ error: "L'identifiant de la ressource est requis" });
	}
    
	const result = DAO.removeResource(id);
	return result.error
		? res.status(404).json(result)
		: res.status(200).json(result);
});

export default router;  // Export du routeur pour l'importer dans server.js
