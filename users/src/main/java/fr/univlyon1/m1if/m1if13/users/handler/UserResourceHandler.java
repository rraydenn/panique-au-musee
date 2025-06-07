package fr.univlyon1.m1if.m1if13.users.handler;

import fr.univlyon1.m1if.m1if13.users.dto.UserResponseDto;
import fr.univlyon1.m1if.m1if13.users.dto.UsersResponseDto;
import fr.univlyon1.m1if.m1if13.users.model.User;
import fr.univlyon1.m1if.m1if13.users.service.UserResourceService;
import jakarta.servlet.ServletException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

import javax.naming.NameAlreadyBoundException;
import javax.naming.NameNotFoundException;
import java.io.IOException;
import java.net.URI;

/**
 * Handler qui contient la logique du contrôleur de ressources sur les utilisateurs.
 */
@Component
public class UserResourceHandler {

    @Autowired
    private UserResourceService userResourceService;

    public ServerResponse getAllUsers(ServerRequest request) {
        UsersResponseDto usersDto = userResourceService.getAllUsersDto();
        return ServerResponse.ok()
                .header("Access-Control-Allow-Origin", determineAllowedOrigin(request))
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")
                .header("Access-Control-Allow-Credentials", "true")
                .header("Access-Control-Expose-Headers", "Authorization")
                .contentType(MediaType.APPLICATION_JSON)
                .body(usersDto);
    }

    public ServerResponse createUser(ServerRequest request) throws ServletException, IOException {
        User user = request.body(User.class);
        try {
            URI location = userResourceService.createUser(user);
            return ServerResponse.created(location)
                    .header("Access-Control-Allow-Origin", determineAllowedOrigin(request))
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Expose-Headers", "Authorization")
                    .build();
        } catch (NameAlreadyBoundException e) {
            return ServerResponse.status(HttpStatus.CONFLICT)
                    .header("Access-Control-Allow-Origin", determineAllowedOrigin(request))
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Expose-Headers", "Authorization")
                    .body("Un utilisateur avec le login " + user.getLogin() + " existe déjà.");
        }
    }

    public ServerResponse getUser(ServerRequest request) {
        String userId = request.pathVariable("userId");
        try {
            UserResponseDto user = userResourceService.getUser(userId);
            return ServerResponse.ok()
                    .header("Access-Control-Allow-Origin", determineAllowedOrigin(request))
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Expose-Headers", "Authorization")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(user);
        } catch (NameNotFoundException e) {
            return ServerResponse.notFound()
                    .header("Access-Control-Allow-Origin", determineAllowedOrigin(request))
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Expose-Headers", "Authorization")
                    .build();
        }
    }

    public ServerResponse updateUser(ServerRequest request) throws ServletException, IOException, NameNotFoundException {
        String userId = request.pathVariable("userId");
        String origin = request.headers().firstHeader("Origin");
        User user = request.body(User.class);

        try {
            userResourceService.createUser(user);
            return ServerResponse.created(URI.create("users/" + userId))
                    .header("Access-Control-Allow-Origin", determineAllowedOrigin(request))
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Expose-Headers", "Authorization")
                    .build();
        } catch (NameAlreadyBoundException e) {
            userResourceService.updateUser(userId, user, origin, request.servletRequest());
            return ServerResponse.noContent()
                    .header("Access-Control-Allow-Origin", determineAllowedOrigin(request))
                    .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                    .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")
                    .header("Access-Control-Allow-Credentials", "true")
                    .header("Access-Control-Expose-Headers", "Authorization")
                    .build();
        }
    }

    public ServerResponse deleteUser(ServerRequest request) {
        String userId = request.pathVariable("userId");
        try {
            userResourceService.deleteUser(userId);
        } catch (NameNotFoundException ignored) {}
        return ServerResponse.noContent()
                .header("Access-Control-Allow-Origin", determineAllowedOrigin(request))
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin")
                .header("Access-Control-Allow-Credentials", "true")
                .header("Access-Control-Expose-Headers", "Authorization")
                .build();
    }

    private String determineAllowedOrigin(ServerRequest request) {
        String origin = request.headers().firstHeader("Origin");
        
        // List of allowed origins
        String[] allowedOrigins = {
            "https://192.168.75.94",
            "https://192.168.75.94:443",
            "http://192.168.75.94",
            "http://192.168.75.94:80",
            "https://192.168.75.94:8443",
            "https://192.168.75.94:8080",
            "https://192.168.75.94:3376",
            "http://192.168.75.94:3376",
            "http://localhost",
            "https://localhost",
            "http://127.0.0.1",
            "http://localhost:8080",
            "http://localhost:5173",
            "https://localhost:8443"
        };
        
        if (origin == null) {
            return "https://192.168.75.94";
        }
        
        for (String allowed : allowedOrigins) {
            if (origin.equals(allowed) || origin.contains("localhost")) {
                return origin;
            }
        }
        
        return "https://192.168.75.94";
    }
}
