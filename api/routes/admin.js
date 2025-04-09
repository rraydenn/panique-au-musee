import express from 'express';
import jwtDecode from 'jwt-decode';

const router = express.Router();

// Store game settings
const gameState = {
	zrr: null,
	defaultTTL: 60, // 1 minute default
	players: {},
	vitrines: []
};

// Middleware to verify admin privileges
function verifyAdmin(req, res, next) {
	const authHeader = req.headers["authorization"];
  
	if (!authHeader) {
		return res.status(401).json({ error: "Unauthorized: No token provided" });
	}

	const token = authHeader.substring(7); // Remove "Bearer "
	let decodedToken;

	try {
		decodedToken = jwtDecode(token);
    
		// Check if user has admin role
		if (!decodedToken.roles || !decodedToken.roles.includes("ADMIN")) {
			return res.status(403).json({ error: "Forbidden: Admin privileges required" });
		}
    
		req.user = decodedToken;
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
  
	// Validate input
	if (!Array.isArray(point1) || point1.length !== 2 || !Array.isArray(point2) || point2.length !== 2) {
		return res.status(400).json({ error: "Invalid points format. Expected format: [lat, lng]" });
	}
  
	// Calculate the rectangle corners
	const [lat1, lng1] = point1;
	const [lat2, lng2] = point2;
  
	gameState.zrr = {
		"limite-NO": [Math.max(lat1, lat2), Math.min(lng1, lng2)],
		"limite-NE": [Math.max(lat1, lat2), Math.max(lng1, lng2)],
		"limite-SE": [Math.min(lat1, lat2), Math.max(lng1, lng2)],
		"limite-SO": [Math.min(lat1, lat2), Math.min(lng1, lng2)]
	};
  
	res.status(200).json(gameState.zrr);
});

// 2. Set initial TTL
router.post('/ttl', (req, res) => {
	const { ttl } = req.body;
  
	if (typeof ttl !== 'number' || ttl <= 0) {
		return res.status(400).json({ error: "TTL must be a positive number" });
	}
  
	gameState.defaultTTL = ttl;
	res.status(200).json({ ttl: gameState.defaultTTL });
});

// 3. Set player role
router.post('/player-role', (req, res) => {
	const { username, role } = req.body;
  
	if (!username || typeof username !== 'string') {
		return res.status(400).json({ error: "Username is required" });
	}
  
	if (!['voleur', 'policier'].includes(role)) {
		return res.status(400).json({ error: "Role must be 'voleur' or 'policier'" });
	}
  
	// Initialize or update player role
	gameState.players[username] = {
		...(gameState.players[username] || {}),
		role,
		treated: 0 // Initialize treated vitrines count
	};
  
	res.status(200).json({ username, role });
});

// 4. Trigger vitrine appearance
router.post('/vitrine', (req, res) => {
	const { position } = req.body;
  
	if (!Array.isArray(position) || position.length !== 2) {
		return res.status(400).json({ error: "Position must be [lat, lng]" });
	}
  
	const newVitrine = {
		id: `vitrine-${Date.now()}`, // Generate unique ID
		position,
		role: 'vitrine',
		ttl: gameState.defaultTTL
	};
  
	gameState.vitrines.push(newVitrine);
	res.status(201).json(newVitrine);
});

export default router;