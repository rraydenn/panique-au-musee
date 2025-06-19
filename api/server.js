import express from "express";
import jwtDecode from "jwt-decode";
import path from "path";
import { fileURLToPath } from "url";
import adminRouter from "./routes/admin.js";
import gameRouter from "./routes/game.js";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3376;

// Définition des origines autorisées pour CORS
const allowedOrigins = ["http://localhost", "http://localhost:8080", "http://localhost:8081", "https://192.168.75.94", "http://192.168.75.94", "http://127.0.0.1"];

app.use(cors({
	origin: function (origin, callback) {
		if (!origin) return callback(null, true);
		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		} else {
			return callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	exposedHeaders: ["Authorization"]
}));

// Add JSON body parser middleware
app.use(express.json());

// Servir les fichiers statiques depuis "public" sous "/static"
app.use("/static", express.static(path.join(__dirname, "public")));

// Middleware d'authentification JWT
function verifyJWTMiddleware(req, res, next) {
	const authHeader = req.headers["authorization"];
	const origin = req.headers["origin"] || "http://localhost";

	if (!authHeader) {
		return res.status(401).json({ message: "Unauthorized: No token provided" });
	}

	const token = authHeader.substring(7); // "Bearer " = 7 caractères
	let decodedToken;

	try {
		decodedToken = jwtDecode(token);
	} catch {
		return res.status(403).json({ message: "Invalid token" });
	}

	if (!allowedOrigins.includes(origin) || !allowedOrigins.includes(decodedToken.origin)) {
		return res.status(403).json({ message: "Forbidden: Invalid origin" });
	}

	req.user = decodedToken; // Store decoded token in request object
	next();
}

// Routes du jeu avec vérification JWT
app.use("/game", verifyJWTMiddleware, gameRouter);

// Routes d'administration avec vérification JWT
app.use("/admin", verifyJWTMiddleware, adminRouter);

// Route GET /
app.get("/", verifyJWTMiddleware, (req, res) => {
	res.status(200).send(`Bonjour ${req.user.sub}`);
});

// Middleware 404 - route non trouvée
app.use((req, res) => {
	res.status(404).send("Route non trouvée");
});

// Middleware d'erreur globale (erreurs non attrapées ailleurs)
app.use((err, req, res) => {
	console.error("Erreur serveur :", err.stack);
	res.status(500).send("Une erreur interne est survenue !");
});

app.listen(PORT, () => {
	console.log(`Serveur démarré sur http://localhost:${PORT}`);
});