package fr.univlyon1.m1if.m1if13.users.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.naming.AuthenticationException;
import javax.naming.NameNotFoundException;

/**
 * Gestionnaire global des erreurs.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Requête invalide : " + e.getMessage());  //HTPP 400
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<String> handleAuthenticationException(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Erreur d'authentification : " + e.getMessage());    //HTTP 401
    }

    @ExceptionHandler(NameNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(NameNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable : " + e.getMessage()); //HTTP 404
    }
}
