package fr.univlyon1.m1if.m1if13.users.model;

import javax.naming.AuthenticationException;

/**
 * Représentation interne d'un utilisateur.
 * Contient à la fois les données "métier" (login, species...) et les données de gestion de la connexion.
 */
public class User {
    private final String login;
    private String password;
    private Species species;
    // Permet d'invalider une connexion même si le token est toujours valide
    private boolean connected = false;
    // Nom du fichier image qui représentera l'utilisateur sur la carte
    private String image;

    public User(String login, String password, Species species, String image) {
        this.login = login;
        this.password = password;
        this.species = species;
        this.image = image;
    }

    public String getLogin() {
        return login;
    }

    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }

    public Species getSpecies() {
        return species;
    }

    public void setSpecies(Species species) {
        this.species = species;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public boolean isConnected() {
        return this.connected;
    }

    public void authenticate(String password) throws AuthenticationException {
        if(!password.equals(this.password)) {
            throw new AuthenticationException("Erroneous password");
        }
        this.connected = true;
    }

    public void disconnect() {
        this.connected = false;
    }
}
