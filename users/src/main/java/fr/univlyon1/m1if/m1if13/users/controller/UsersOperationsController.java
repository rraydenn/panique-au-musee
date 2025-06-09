package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.LoginRequestDto;
import fr.univlyon1.m1if.m1if13.users.service.UserOperationService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;

import javax.naming.AuthenticationException;
import javax.naming.NameNotFoundException;

/**
 * Contrôleur d'opérations métier.
 */
@Controller
public class UsersOperationsController {

    @Autowired
    private UserOperationService userOperationService;

    /**
     * Procédure de login via un formulaire HTML.
     * TODO: cette méthode ne doit pas apparaître dans la documentation de l'API.
     * @param login Le login de l'utilisateur. L'utilisateur doit avoir été créé préalablement et son login doit être présent dans le DAO.
     * @param password Le password à vérifier.
     * @return Une ResponseEntity avec le JWT dans le header "Authorization" si le login s'est bien passé, et le code de statut approprié (204, 401 ou 404).
     */
    @Hidden
    @CrossOrigin(origins = {"http://localhost", "http://127.0.0.1", "http://localhost:8080", "http://localhost:8081", "http://192.168.75.94", "https://192.168.75.94", "http://192.168.75.94:8080", "https://192.168.75.94:8443"}, 
                exposedHeaders = {"Authorization"},
                allowCredentials = "true")
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> login(
            @RequestParam String login, @RequestHeader("Origin") String origin, @RequestParam String password, HttpServletRequest request)
            throws AuthenticationException, NameNotFoundException {
        return login(new LoginRequestDto(login, password), origin, request);
    }

    /**
     * Procédure de login via un objet JSON.
     * @param loginDto Un objet JSON contenant login et le mot de passe de l'utilisateur.
     * L'utilisateur doit avoir été créé préalablement et son login doit être présent dans le DAO.
     * @return Une ResponseEntity avec le JWT dans le header "Authorization" si le login s'est bien passé, et le code de statut approprié (204, 401 ou 404).
     */
    @Operation(summary = "Connection d'un utilisateur", description = "Permet à un utilisateur de se connecter et de recevoir un JWT.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Connexion réussie"),
            @ApiResponse(responseCode = "401", description = "Échec d'authentification"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    @CrossOrigin(origins = {"http://localhost", "http://127.0.0.1", "http://localhost:8080", "http://localhost:8081", "http://192.168.75.94", "https://192.168.75.94", "http://192.168.75.94:8080", "https://192.168.75.94:8443"},
                exposedHeaders = {"Authorization"},
                allowCredentials = "true")
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> login(
            @Parameter(description = "Identifiants de l'utilisateur") @RequestBody LoginRequestDto loginDto,
            @Parameter(description = "Origine de la requête") @RequestHeader("Origin") String origin,
            HttpServletRequest request)
            throws AuthenticationException, NameNotFoundException {
        userOperationService.login(loginDto, origin, request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Réalise la déconnexion.
     */
    @Operation(summary = "Déconnexion de l'utilisateur", description = "Met fin à la session de l'utilisateur en invalidant son token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Déconnexion réussie")
    })
    @CrossOrigin(origins = {"http://localhost", "http://127.0.0.1", "http://localhost:8080", "http://localhost:8081", "http://192.168.75.94", "https://192.168.75.94", "http://192.168.75.94:8080", "https://192.168.75.94:8443"},
                allowCredentials = "true")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @Parameter(description = "Nom d'utilisateur") @RequestAttribute("username") String username) {
        userOperationService.logout(username);
        return ResponseEntity.noContent().build();
    }

    /**
     * Méthode destinée au serveur Express pour valider l'authentification d'un utilisateur.
     * @param jwt Le token JWT qui se trouve dans le header "Authorization" de la requête
     * @param origin L'origine de la requête (pour la comparer avec celle du client, stockée dans le token JWT)
     * @return Une réponse vide avec un code de statut approprié (204, 400, 401).
     */
    @Operation(summary = "Vérification de l'authentification", description = "Vérifie si un utilisateur est toujours authentifié avec son token JWT.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Utilisateur authentifié"),
            @ApiResponse(responseCode = "400", description = "Paramètres manquants"),
            @ApiResponse(responseCode = "401", description = "Token invalide ou utilisateur non authentifié")
    })
    @CrossOrigin(origins = {"http://localhost", "http://127.0.0.1", "http://localhost:8080", "http://localhost:8081", "http://192.168.75.94", "https://192.168.75.94", "http://192.168.75.94:8080", "https://192.168.75.94:8443"},
                allowCredentials = "true")
    @GetMapping(value = "/authenticate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> authenticate(
            @Parameter(description = "Token JWT de l'utilisateur") @RequestParam("jwt") String jwt,
            @Parameter(description = "Origine de la requête") @RequestParam("origin") String origin)
            throws AuthenticationException {
        if (origin.isEmpty() || jwt.isEmpty()) {
            throw new IllegalArgumentException("Le token JWT et l'origine sont obligatoires.");
        }
        if (!userOperationService.authenticate(jwt, origin)) {
            throw new AuthenticationException("Échec de l'authentification.");
        }
        return ResponseEntity.noContent().build();
    }
}
