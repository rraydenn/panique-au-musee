package fr.univlyon1.m1if.m1if13.users.dao;

import fr.univlyon1.m1if.m1if13.users.model.User;
import org.springframework.stereotype.Component;

import java.io.Serializable;

/**
 * Implémentation (basique) de l'interface DAO pour la classe <code>User</code>.
 *
 * @author Lionel Médini
 */
@Component
public class UserDao extends AbstractMapDao<User> {
    @Override
    protected Serializable getKeyForElement(User element) {
        return element.getLogin();
    }
}
