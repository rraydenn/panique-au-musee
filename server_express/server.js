const express = require("express");
const jwtDecode = require("jwt-decode");

const app = express();
const PORT = 3376; // Choisissez le port que vous souhaitez

app.get("/", (req, res) => {
    // Récupération des headers
    const authHeader = req.headers["authorization"];
    const origin = req.headers["origin"] || "http://localhost";

    if (!authHeader) {
        return res.status(401).json({ error: `Unauthorized: No token provided` });
    }

    const token = authHeader.substring(7) // On suppose que le header est de la forme "Bearer <token>"

    try {
        // Décodage du token
        const decodedToken = jwtDecode(token);

        const allowedOrigins = ["http://localhost", "https://192.168.75.94"];
        // Vérification de l'origine
        if (allowedOrigins.includes(origin) && allowedOrigins.includes(decodedToken.origin)) {
                return res.status(200).send(`Bonjour ${decodedToken.sub}`);
        } else {
                return res.status(403).json({ error: "Forbidden: Invalid origin" });
        }
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
