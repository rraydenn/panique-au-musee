import express from "express";
import jwtDecode from "jwt-decode";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3376; // Choisissez le port que vous souhaitez

// Servir les fichiers statiques depuis "public" sous "/static"
app.use("/static", express.static(path.join(__dirname, "public")));

// Route GET /
app.get("/", (req, res) => {
	try {
		const decoded = verifyJWT(req);
		res.status(200).send(`Bonjour ${decoded.sub}`);
	} catch (err) {
		res.status(err.status || 500).json({ error: err.message || "Internal server error" });
	}
});

//Middleware 404 - route non trouvée
app.use((req, res, next) => {
	res.status(404).send("Route non trouvée");
	next();
});

// Middleware d’erreur globale (erreurs non attrapées ailleurs)
app.use((err, req, res, next) => {
	console.error("Erreur serveur :", err.stack);
	res.status(500).send("Une erreur interne est survenue !");
	next();
});

// Middleware d'authentification JWT
function verifyJWT(req) {
	const authHeader = req.headers["authorization"];
	const origin = req.headers["origin"] || "http://localhost";

	if (!authHeader) {
		throw { status: 401, message: "Unauthorized: No token provided" };
	}

	const token = authHeader.substring(7); // "Bearer " = 7 caractères
	let decodedToken;

	try {
		decodedToken = jwtDecode(token);
	} catch {
		throw { status: 403, message: "Invalid token" };
	}

	const allowedOrigins = ["http://localhost", "https://192.168.75.94"];

	if (!allowedOrigins.includes(origin) || !allowedOrigins.includes(decodedToken.origin)) {
		throw { status: 403, message: "Forbidden: Invalid origin" };
	}

	return decodedToken;
}


app.listen(PORT, () => {
	console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
