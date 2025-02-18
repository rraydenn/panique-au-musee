package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.UserResponseDto;
import fr.univlyon1.m1if.m1if13.users.dto.UsersResponseDto;
import fr.univlyon1.m1if.m1if13.users.model.User;
import fr.univlyon1.m1if.m1if13.users.service.UserResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.server.ResponseStatusException;

import javax.naming.NameAlreadyBoundException;
import javax.naming.NameNotFoundException;
import java.net.URI;

/**
 * Aiguillage des requêtes liées aux ressources des utilisateurs.
 */
@RestController
@RequestMapping("/users")
public class UserResourceController {

    @Autowired
    private UserResourceService userResourceService;


    @Operation(
            summary = "Obtenir tous les utilisateurs",
            description = "Récupère la liste de tous les utilisateurs.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Liste d'utilisateurs récupérée avec succès",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "500",
                            description = "Erreur interne du serveur"
                    )
            }
    )
    @GetMapping(produces = {"application/json", "application/xml"})
    public ResponseEntity<UsersResponseDto> getAllUsers() {
        return ResponseEntity.ok(userResourceService.getAllUsersDto());
    }


    @Operation(
            summary = "Créer un utilisateur",
            description = "Crée un nouvel utilisateur",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Utilisateur créé avec succès"
                    ),
                    @ApiResponse(
                            responseCode = "409",
                            description = "un utilisateur avec ce login existe déjà"
                    )
            }
    )
    @PostMapping(consumes = {"application/json", "application/xml"})
    public ResponseEntity<Void> createUser(
            @Parameter(description = "Détails de l'utilisateur à créer") @RequestBody User user) {
        try {
            return ResponseEntity.created(userResourceService.createUser(user)).build();
        } catch (NameAlreadyBoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Un utilisateur avec le login " + user.getLogin() + " existe déjà."
            );
        }
    }


    @Operation(
            summary = "Obtenir un utilisateur par sont ID",
            description = "Récupère un utilisateur spécifique en fonction de son identifiant et affiche ces informations.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Utilisateur trouvé",
                            content = @Content(mediaType = "application/json")
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Utilisateur non trouvé"
                    )
            }
    )
    @CrossOrigin(origins = {"http://localhost", "http://192.168.75.XXX", "https://192.168.75.XXX"})
    @GetMapping(value = "/{userId}", produces = {"application/json", "application/xml"})
    public ResponseEntity<UserResponseDto> getUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String userId) {
        try {
            return ResponseEntity.ok(userResourceService.getUser(userId));
        } catch (NameNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Utilisateur " + userId + " inconnu."
            );
        }
    }


    @Operation(
            summary = "Mise à jour d'un utilisateur",
            description = "Met à jour les informations d'un utilisateur existant.",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Utilisateur mis à jour avec succès"
                    ),
                    @ApiResponse(
                            responseCode = "204",
                            description = "Aucune modification nécessaire"
                    )
            }
    )
    @PutMapping(value = "/{userId}", consumes = {"application/json", "application/xml"})
    public ResponseEntity<Void> updateUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String userId,
            @Parameter(description = "Détails de l'utilisateur à mettre à jour") @RequestBody User user,
            @RequestHeader("Origin") String origin,
            HttpServletResponse response) {
        try {
            userResourceService.createUser(user);
            return ResponseEntity.created(URI.create("users/" + userId)).build();
        } catch (NameAlreadyBoundException e) {
            userResourceService.updateUser(userId, user, origin, response);
            return ResponseEntity.noContent().build();
        }
    }


    @Operation(
            summary = "Supprimer un utilisateur",
            description = "Supprime un utilisateur en fonction de son identifiant.",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Utilisateur supprimé avec succès"
                    )
            }
    )
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "Identifiant de l'utilisateur") @PathVariable String userId) {
        try {
            userResourceService.deleteUser(userId);
        } catch (NameNotFoundException ignored) { }
        return ResponseEntity.noContent().build();
    }
}
