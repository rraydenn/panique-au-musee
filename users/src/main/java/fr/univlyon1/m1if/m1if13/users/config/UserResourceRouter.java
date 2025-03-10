package fr.univlyon1.m1if.m1if13.users.config;

import fr.univlyon1.m1if.m1if13.users.handler.UserResourceHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.web.servlet.function.RequestPredicates.accept;
import static org.springframework.web.servlet.function.RequestPredicates.contentType;
import static org.springframework.web.servlet.function.RequestPredicates.DELETE;
import static org.springframework.web.servlet.function.RequestPredicates.GET;
import static org.springframework.web.servlet.function.RequestPredicates.POST;
import static org.springframework.web.servlet.function.RequestPredicates.PUT;

/**
 * Aiguillage des requêtes liées aux ressources des utilisateurs.
 */
@Configuration
public class UserResourceRouter {

    @Bean
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
