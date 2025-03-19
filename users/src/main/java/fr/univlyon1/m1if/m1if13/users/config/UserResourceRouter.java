package fr.univlyon1.m1if.m1if13.users.config;

import fr.univlyon1.m1if.m1if13.users.handler.UserResourceHandler;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.web.servlet.function.RequestPredicates.accept;
import static org.springframework.web.servlet.function.RequestPredicates.contentType;

import org.springdoc.core.annotations.RouterOperation;
import org.springdoc.core.annotations.RouterOperations;

import static org.springframework.web.servlet.function.RequestPredicates.DELETE;
import static org.springframework.web.servlet.function.RequestPredicates.GET;
import static org.springframework.web.servlet.function.RequestPredicates.POST;
import static org.springframework.web.servlet.function.RequestPredicates.PUT;

/**
 * Aiguillage des requêtes liées aux ressources des utilisateurs.
 */
@Configuration
@OpenAPIDefinition(tags = {
    @Tag(name = "User Resource Controller")
})
public class UserResourceRouter {

    @Bean
    @RouterOperations({

    // 1) GET /users
    @RouterOperation(
        path = "/users",
        method = {org.springframework.web.bind.annotation.RequestMethod.GET},
        beanClass = UserResourceHandler.class,
        beanMethod = "getAllUsers",
        operation = @Operation(
            summary = "Obtenir tous les utilisateurs",
            description = "Récupère la liste de tous les utilisateurs.",
            responses = {
                @ApiResponse(responseCode = "200", description = "Liste d'utilisateurs récupérée avec succès",
                        content = @Content(mediaType = "application/json")),
                @ApiResponse(responseCode = "500", description = "Erreur interne du serveur")
            }
        )
    ),

    // 2) POST /users
    @RouterOperation(
        path = "/users",
        method = {org.springframework.web.bind.annotation.RequestMethod.POST},
        beanClass = UserResourceHandler.class,
        beanMethod = "createUser",
        operation = @Operation(
            summary = "Créer un utilisateur",
            description = "Crée un nouvel utilisateur",
            responses = {
                @ApiResponse(responseCode = "201", description = "Utilisateur créé avec succès"),
                @ApiResponse(responseCode = "409", description = "Un utilisateur avec ce login existe déjà")
            }
        )
    ),

    // 3) GET /users/{userId}
    @RouterOperation(
        path = "/users/{userId}",
        method = {org.springframework.web.bind.annotation.RequestMethod.GET},
        beanClass = UserResourceHandler.class,
        beanMethod = "getUser",
        operation = @Operation(
            summary = "Obtenir un utilisateur par son ID",
            description = "Récupère un utilisateur spécifique en fonction de son identifiant et affiche ces informations.",
            responses = {
                @ApiResponse(responseCode = "200", description = "Utilisateur trouvé", content = @Content(mediaType = "application/json")),
                @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
            }
        )
    ),

    // 4) PUT /users/{userId}
    @RouterOperation(
        path = "/users/{userId}",
        method = {org.springframework.web.bind.annotation.RequestMethod.PUT},
        beanClass = UserResourceHandler.class,
        beanMethod = "updateUser",
        operation = @Operation(
            summary = "Mise à jour d'un utilisateur",
            description = "Met à jour les informations d'un utilisateur existant.",
            responses = {
                @ApiResponse(responseCode = "201", description = "Utilisateur mis à jour avec succès"),
                @ApiResponse(responseCode = "204", description = "Aucune modification nécessaire")
            }
        )
    ),

    // 5) DELETE /users/{userId}
    @RouterOperation(
        path = "/users/{userId}",
        method = {org.springframework.web.bind.annotation.RequestMethod.DELETE},
        beanClass = UserResourceHandler.class,
        beanMethod = "deleteUser",
        operation = @Operation(
            summary = "Supprimer un utilisateur",
            description = "Supprime un utilisateur en fonction de son identifiant.",
            responses = {
                @ApiResponse(responseCode = "204", description = "Utilisateur supprimé avec succès")
            }
        )
    )
})
    public RouterFunction<ServerResponse> userRoutes(UserResourceHandler userHandler) {
        return RouterFunctions
                .route(GET("/users").and(accept(MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML)),
                        userHandler::getAllUsers)
                .andRoute(POST("/users").and(contentType(MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML)),
                        userHandler::createUser)
                .andRoute(GET("/users/{userId}").and(accept(MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML)),
                        userHandler::getUser)
                .andRoute(PUT("/users/{userId}").and(contentType(MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML)),
                        userHandler::updateUser)
                .andRoute(DELETE("/users/{userId}"),
                        userHandler::deleteUser);
    }
}
