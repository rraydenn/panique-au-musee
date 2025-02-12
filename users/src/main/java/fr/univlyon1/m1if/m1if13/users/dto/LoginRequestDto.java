package fr.univlyon1.m1if.m1if13.users.dto;

/**
 * DTO envoyé par le client pour connecter un utilisateur.
 * @param login Le login de l'utilisateur
 * @param password Le password de l'utilisateur
 */
public record LoginRequestDto(String login, String password) {}
