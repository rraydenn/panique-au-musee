package fr.univlyon1.m1if.m1if13.users.model;

import javax.naming.AuthenticationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.fail;

/**
 * Tests de la classe User.
 */
class UserTest {
    private User arsene;
    private User francois;

    @BeforeEach
    void setUp() {
        arsene = new User("Arsene Lupin", "montenlair", Species.VOLEUR, null);
        francois = new User("François Perrin", "ChaussureNoire", Species.POLICIER, null);
    }

    @Test
    void getLogin() {
        assert(arsene.getLogin().equals("Arsene Lupin"));
        assert(francois.getLogin().equals("François Perrin"));
    }

    @Test
    void getSpecies() {
        assert(arsene.getSpecies().equals(Species.VOLEUR));
        assert(francois.getSpecies().equals(Species.POLICIER));
    }

    @Test
    void setPassword() {
        arsene.setPassword("ectoplasme");
        try {
            arsene.authenticate("ectoplasme");
            assert(true);
        } catch (AuthenticationException e) {
            fail(e.getMessage());
        }
    }

    @Test
    void isConnected() {
        try {
            arsene.authenticate("montenlair");
            assert(arsene.isConnected());
            arsene.disconnect();
            assert(!arsene.isConnected());
        } catch (AuthenticationException e) {
            fail(e.getMessage());
        }
    }

    @Test
    void authenticate() {
        try {
            arsene.authenticate("montenlair");
            assert(true);
        } catch (AuthenticationException e) {
            fail(e.getMessage());
        }

        try {
            francois.authenticate("montenlair");
            fail("Mot de passe incorrect");
        } catch (AuthenticationException e) {
            assert(true);
        }
    }

    @Test
    void disconnect() {
        try {
            arsene.authenticate("montenlair");
            arsene.disconnect();
            assert(!arsene.isConnected());
        } catch (AuthenticationException e) {
            fail(e.getMessage());
        }
    }
}
