package fr.univlyon1.m1if.m1if13.users.util;

import fr.univlyon1.m1if.m1if13.users.dao.UserDao;
import fr.univlyon1.m1if.m1if13.users.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

/**
 * Classe utilitaire qui fournit le token JWT, le décode, et le modifie.
 */
@Component
public class UserTokenProvider {
    private static final String ISSUER_NAME = "m1if13-user-api";
    public static final String SPECIES_CLAIM_NAME = "species";
    private static final String ORIGIN_CLAIM_NAME = "origin";
    private final SecretKey key = Jwts.SIG.HS512.key().build();
    @Autowired
    private UserDao userDao;

    @Value("${jwt.expirationMs}")
    private int jwtExpirationMs;

    public UserTokenProvider() {
    }

    /**
     * Génère un token pour un utilisateur "simple".
     * @param user L'utilisateur (login et d'autres claims seront dans le token).
     * @return Le token généré.
     */
    public String generateToken(User user, String origin) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(user.getLogin())
                .issuer(ISSUER_NAME)
                .issuedAt(now)
                .expiration(expiryDate)
                .claim(SPECIES_CLAIM_NAME, user.getSpecies())
                .claim(ORIGIN_CLAIM_NAME, origin)
                .signWith(key)
                .compact();
    }

    /**
     * Génère un token avec les propriétés passées en paramètres.
     * @param claims Une <code>Map&lt;String, Object&gt;</code> contenant les propriétés à ajouter comme claims.
     * @return Le token généré.
     */
    public String generateToken(Map<String, Object> claims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .claims(claims)
                .issuer(ISSUER_NAME)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Vérifie que le token est valide par rapport à la clé.
     * @param token Une <code>String</code> contenant un JWT.
     * @return True si le paramètre est bien un token JWT et s'il a pu être correctement vérifié, false sinon.
     */
    public boolean validateToken(String token, String origin) {
        try {
            Claims claims = (Claims) Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parse(token)
                    .getPayload();

            String username = claims.getSubject(); // extraction de l'identifiant

            User extractedUser = null;
            try {
                extractedUser = userDao.findOne(username);
            } catch (Exception ex) {
                System.out.println("Erreur lors de la recherche de l'utilisateur : " + ex.getMessage());
            }

            if (extractedUser != null && extractedUser.isConnected()) {
                return claims.get(ORIGIN_CLAIM_NAME, String.class).equals(origin);
            } else {
                return false;
            }
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Renvoie l'ensemble des claims contenus dans le token.
     * @param token Le JWT à analyser
     * @return Un ensemble de <code>Claims</code> (hérite de <code>Map&lt;String, Object&gt;</code>)
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Récupère le login de l'utilisateur (dans le claim "subject" du token JWT).
     * @param token Un token JWT qui contient un claim 'sub'
     * @return Le contenu du claim 'sub'
     */
    public String extractUsername(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    /**
     * Permet de récupérer un claim, casté dans un format particulier (Serializable).
     * @param token Un token JWT
     * @param claimName Le nom du claim recherché
     * @param clazz La classe de l'objet sérialisé initialement dans le claim
     * @return Une instance de <code>clazz</code> possédant les propriétés contenues dans le claim
     * @param <T> Type paramétrable correspondant à <code>clazz</code>
     */
    public <T> T extractClaim(String token, String claimName, Class<T> clazz) {
        return getClaimsFromToken(token).get(claimName, clazz);
    }

    /**
     * Vérifie si un token JWT est expiré ou non.
     * @param token Un token JWT
     * @return Un booléen qui indique si la date d'expiration est dépassée
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiry(token).before(new Date());
    }

    /**
     * Renvoie la date d'expiration d'un token JWT.
     * @param token Un token JWT
     * @return La date d'expiration du token
     */
    public Date extractExpiry(String token) {
        return extractClaim(token, "exp", Date.class);
    }

    /**
     * Indique si l'utilisateur est déjà connecté.
     * Si c'est le cas, ajoute un attribut "username" à la requête pour simplifier les traitements ultérieurs.
     * @param request la requête contenant les informations de connexion éventuelle
     * @return un booléen ...
     */
    public boolean isUserConnected(HttpServletRequest request) {
        String jwt = request.getHeader("Authorization");
        if(jwt != null && jwt.startsWith("Bearer ")) {
            try {
                jwt = jwt.substring(7);
                String origin = extractClaim(jwt, ORIGIN_CLAIM_NAME, String.class);
                if (validateToken(jwt, origin)) {
                    request.setAttribute("username", extractUsername(jwt));
                    return true;
                }
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }
}
