import express from 'express';
import DAO from '../dao/gameDao.js';

const router = express.Router();

// 2. Set initial TTL
let defaultTTL = 60; // TTL par défaut, conservé localement

// Middleware to verify admin privileges
function verifyAdmin(req, res, next) {
	try {
		// Check if user has admin role
		if (!req.user.species || !req.user.species.includes("ADMIN")) {
			return res.status(403).json({ error: "Forbidden: Admin privileges required" });
		}
    		next();
	} catch (error) {
		return res.status(error.status).json({ error: "Invalid token" });
	}
}

// Apply admin verification middleware to all routes
router.use(verifyAdmin);
router.use(express.json());

// 1. Set game perimeter (ZRR)
router.post('/zrr', (req, res) => {
	const { point1, point2 } = req.body;

	// Calculate the rectangle corners
	const [lat1, lng1] = point1;
	const [lat2, lng2] = point2;

	const bounds = [
		{ latitude: lat1, longitude: lng1 },
		{ latitude: lat2, longitude: lng2 }
	];
	const result = DAO.setZRR(bounds);

	return result.error ? res.status(400).json(result) : res.status(200).json(bounds);
});

// 2. Set initial TTL
router.post('/ttl', (req, res) => {
	const { ttl } = req.body;
  
	if (typeof ttl !== 'number' || ttl <= 0) {
		return res.status(400).json({ error: "TTL must be a positive number" });
	}
  
	defaultTTL = ttl;
	res.status(200).json({ ttl: defaultTTL });
});

// 3. Set player role A REFAIRE !
router.post('/player-role', (req, res) => {
	const { username, role, image } = req.body;
  
	if (!username || typeof username !== 'string') {
		return res.status(400).json({ error: "Username is required" });
	}
  
	if (!['VOLEUR', 'POLICIER'].includes(role)) {
		return res.status(400).json({ error: "Role must be 'voleur' or 'policier'" });
	}

	const result = DAO.addResource({
		id: username,
		role,
		position: { latitude: 45.78207, longitude: 4.86559 },
		showcases: 0,
		image,
		...(role === 'POLICIER' && { terminated: 0 }), // Ajoute terminated uniquement si policier
		...(role === 'VOLEUR' && { captured: false }) // Ajoute captured uniquement si voleur
	});
	return result.error ? res.status(400).json(result) : res.status(200).json({ username, role, image });	
});

// 4. Trigger vitrine appearance
router.post('/vitrine', (req, res) => {
	const { position } = req.body;
  
	if (!Array.isArray(position) || position.length !== 2) {
		return res.status(400).json({ error: "Position must be [lat, lng]" });
	}

	if (!DAO.isPositionInZRR(position[0], position[1])) {
		return res.status(400).json({ error: "Position hors de la ZRR" });
	}
  
	const newVitrine = {
		id: `vitrine-${Date.now()}`,
		position: { latitude: position[0], longitude: position[1] },
		role: 'vitrine',
		ttl: defaultTTL
	};
	
	const result = DAO.addResource(newVitrine);
	return result.error ? res.status(400).json(result) : res.status(201).json(newVitrine);
});

// 6. Changer l'espece d'un joueur
router.put("/resource/:id/role", (req, res) => {
	const { id } = req.params;
	const { role } = req.body;

	const result = DAO.updatePlayerRole(id, role);
	return result.error
		? res.status(404).json(result)
		: res.status(200).json(result);
});

// 7. Mettre fin à la partie
router.post("/end-game", (req, res) => {
	const result = DAO.endGame();
	return res.status(200).json(result);
});

// 8. Réinitialiser le jeu pour une nouvelle partie
router.post("/reset-game", (req, res) => {
	const result = DAO.resetGame();
	return res.status(200).json(result);
});

router.delete("/resource/:id", (req, res) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ error: "L'identifiant du joueur est requis" });
	}

	const result = DAO.deleteResource(id);
	return result.error
		? res.status(404).json(result)
		: res.status(200).json(result);
});

export default router;