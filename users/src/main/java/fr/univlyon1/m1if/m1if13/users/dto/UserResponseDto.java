package fr.univlyon1.m1if.m1if13.users.dto;

import fr.univlyon1.m1if.m1if13.users.model.Species;
import fr.univlyon1.m1if.m1if13.users.model.User;

/**
 * DTO renvoyé pour la représentation d'un utilisateur.
 * @param login Le login de l'utilisateur
 * @param species L'espèce de l'utilisateur
 */
public record UserResponseDto(String login, Species species) {
    public static UserResponseDto of(User user) {
        return new UserResponseDto(user.getLogin(), user.getSpecies());
    }
}
