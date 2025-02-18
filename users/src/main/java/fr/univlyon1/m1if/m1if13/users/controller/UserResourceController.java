package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.UserResponseDto;
import fr.univlyon1.m1if.m1if13.users.dto.UsersResponseDto;
import fr.univlyon1.m1if.m1if13.users.model.User;
import fr.univlyon1.m1if.m1if13.users.service.UserResourceService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @GetMapping(produces = {"application/json", "application/xml"})
    public ResponseEntity<UsersResponseDto> getAllUsers() {
        return ResponseEntity.ok(userResourceService.getAllUsersDto());
    }

    @PostMapping(consumes = {"application/json", "application/xml"})
    public ResponseEntity<Void> createUser(@RequestBody User user) {
        try {
            return ResponseEntity.created(userResourceService.createUser(user)).build();
        } catch (NameAlreadyBoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Un utilisateur avec le login " + user.getLogin() + " existe déjà."
            );
        }
    }

    @CrossOrigin(origins = {"http://localhost", "http://192.168.75.XXX", "https://192.168.75.XXX"})
    @GetMapping(value = "/{userId}", produces = {"application/json", "application/xml"})
    public ResponseEntity<UserResponseDto> getUser(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(userResourceService.getUser(userId));
        } catch (NameNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Utilisateur " + userId + " inconnu."
            );
        }
    }

    @PutMapping(value = "/{userId}", consumes = {"application/json", "application/xml"})
    public ResponseEntity<Void> updateUser(
            @PathVariable String userId, @RequestBody User user, @RequestHeader("Origin") String origin, HttpServletResponse response) {
        try {
            userResourceService.createUser(user);
            return ResponseEntity.created(URI.create("users/" + userId)).build();
        } catch (NameAlreadyBoundException e) {
            userResourceService.updateUser(userId, user, origin, response);
            return ResponseEntity.noContent().build();
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        try {
            userResourceService.deleteUser(userId);
        } catch (NameNotFoundException ignored) { }
        return ResponseEntity.noContent().build();
    }
}
