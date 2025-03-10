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
                .contentType(MediaType.APPLICATION_JSON)
                .body(usersDto);
    }

    public ServerResponse createUser(ServerRequest request) throws ServletException, IOException {
        User user = request.body(User.class);
        try {
            URI location = userResourceService.createUser(user);
            return ServerResponse.created(location).build();
        } catch (NameAlreadyBoundException e) {
            return ServerResponse.status(HttpStatus.CONFLICT)
                    .body("Un utilisateur avec le login " + user.getLogin() + " existe déjà.");
        }
    }

    public ServerResponse getUser(ServerRequest request) {
        String userId = request.pathVariable("userId");
        try {
            UserResponseDto user = userResourceService.getUser(userId);
            return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(user);
        } catch (NameNotFoundException e) {
            return ServerResponse.notFound().build();
        }
    }

    public ServerResponse updateUser(ServerRequest request) throws ServletException, IOException {
        String userId = request.pathVariable("userId");
        String origin = request.headers().firstHeader("Origin");
        User user = request.body(User.class);

        try {
            userResourceService.createUser(user);
            return ServerResponse.created(URI.create("users/" + userId)).build();
        } catch (NameAlreadyBoundException e) {
            userResourceService.updateUser(userId, user, origin, request.servletRequest());
            return ServerResponse.noContent().build();
        }
    }

    public ServerResponse deleteUser(ServerRequest request) {
        String userId = request.pathVariable("userId");
        try {
            userResourceService.deleteUser(userId);
        } catch (NameNotFoundException ignored) {}
        return ServerResponse.noContent().build();
    }
}
