package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.LoginRequestDto;
import fr.univlyon1.m1if.m1if13.users.service.UserOperationService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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
    @CrossOrigin(origins = {"http://localhost", "http://192.168.75.XXX", "https://192.168.75.XXX"}, exposedHeaders = {"Authorization"})
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> login(
            @RequestParam String login, @RequestHeader("Origin") String origin, @RequestParam String password, HttpServletResponse response)
            throws AuthenticationException, NameNotFoundException {
        return login(new LoginRequestDto(login, password), origin, response);
    }

    /**
     * Procédure de login via un objet JSON.
     * @param loginDto Un objet JSON contenant login et le mot de passe de l'utilisateur.
     * L'utilisateur doit avoir été créé préalablement et son login doit être présent dans le DAO.
     * @return Une ResponseEntity avec le JWT dans le header "Authorization" si le login s'est bien passé, et le code de statut approprié (204, 401 ou 404).
     */
    @CrossOrigin(origins = {"http://localhost", "http://192.168.75.XXX", "https://192.168.75.XXX"}, exposedHeaders = {"Authorization"})
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> login(@RequestBody LoginRequestDto loginDto, @RequestHeader("Origin") String origin, HttpServletResponse response)
            throws AuthenticationException, NameNotFoundException {
        userOperationService.login(loginDto, origin, response);
        return ResponseEntity.noContent().build();
    }

    /**
     * Réalise la déconnexion.
     */
    @CrossOrigin(origins = {"http://localhost", "http://192.168.75.XXX", "https://192.168.75.XXX"})
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestAttribute("username") String username) {
        userOperationService.logout(username);
        return ResponseEntity.noContent().build();
    }

    /**
     * Méthode destinée au serveur Express pour valider l'authentification d'un utilisateur.
     * @param jwt Le token JWT qui se trouve dans le header "Authorization" de la requête
     * @param origin L'origine de la requête (pour la comparer avec celle du client, stockée dans le token JWT)
     * @return Une réponse vide avec un code de statut approprié (204, 400, 401).
     */
    @CrossOrigin(origins = {"http://localhost", "http://192.168.75.XXX", "https://192.168.75.XXX"})
    @GetMapping(value = "/authenticate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> authenticate(@RequestParam("jwt") String jwt, @RequestParam("origin") String origin)
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
