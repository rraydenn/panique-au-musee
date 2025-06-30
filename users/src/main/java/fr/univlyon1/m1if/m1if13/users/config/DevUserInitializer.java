package fr.univlyon1.m1if.m1if13.users.config;

import fr.univlyon1.m1if.m1if13.users.dao.UserDao;
import fr.univlyon1.m1if.m1if13.users.model.Species;
import fr.univlyon1.m1if.m1if13.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
public class DevUserInitializer {
    @Autowired
    private UserDao userDao;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeDevUsers() {
        try {
            if (!userExists("a")) {
                User userA = new User("a", "a", Species.VOLEUR, "user-a.png");
                userDao.add(userA);
            }
            if (!userExists("b")) {
                User userB = new User("b", "b", Species.VOLEUR, "user-b.png");
                userDao.add(userB);
            }
            if (!userExists("c")) {
                User userC = new User("c", "c", Species.POLICIER, "user-c.png");
                userDao.add(userC);
            }
            if (!userExists("d")) {
                User userD = new User("d", "d", Species.POLICIER, "user-d.png");
                userDao.add(userD);
            }

            System.out.println("✅ Utilisateurs de développement initialisés !");
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'initialisation des utilisateurs de développement : " + e.getMessage());
        }
    }

    private boolean userExists(String login) {
        try {
            userDao.findOne(login);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}