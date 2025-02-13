package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.LoginRequestDto;
import fr.univlyon1.m1if.m1if13.users.service.UserOperationService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.server.ResponseStatusException;

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
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> login(
            @RequestParam String login, @RequestHeader("Origin") String origin, @RequestParam String password, HttpServletResponse response) {
        return login(new LoginRequestDto(login, password), origin, response);
    }

    /**
     * Procédure de login via un objet JSON.
     * @param loginDto Un objet JSON contenant login et le mot de passe de l'utilisateur.
     * L'utilisateur doit avoir été créé préalablement et son login doit être présent dans le DAO.
     * @return Une ResponseEntity avec le JWT dans le header "Authorization" si le login s'est bien passé, et le code de statut approprié (204, 401 ou 404).
     */
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> login(@RequestBody LoginRequestDto loginDto, @RequestHeader("Origin") String origin, HttpServletResponse response) {
        try {
            userOperationService.login(loginDto, origin, response);
            return ResponseEntity.noContent().build();
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Erreur de correspondance des noms pour l'utilisateur " + loginDto.login() + "."
            );
        } catch (NameNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Utilisateur " + loginDto.login() + " inconnu."
            );
        }
    }

    /**
     * Réalise la déconnexion.
     */
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
    @GetMapping(value = "/authenticate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> authenticate(@RequestParam("jwt") String jwt, @RequestParam("origin") String origin) {
        if (origin.isEmpty() || jwt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } else if (userOperationService.authenticate(jwt, origin)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}
