package fr.univlyon1.m1if.m1if13.users.service;

import fr.univlyon1.m1if.m1if13.users.dto.LoginRequestDto;
import fr.univlyon1.m1if.m1if13.users.model.User;
import fr.univlyon1.m1if.m1if13.users.dao.UserDao;
import fr.univlyon1.m1if.m1if13.users.util.UserTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
import javax.naming.NameNotFoundException;

/**
 * Méthodes de service du contrôleur d'opérations sur les utilisateurs.
  */
@Service
public class UserOperationService {

    @Autowired
    private UserTokenProvider userTokenProvider;
    @Autowired
    private UserDao userDao;

    /**
     * Méthode réalisant le login : valide le contenu de la requête et place les informations sur l'utilisateur dans une Map en attribut de requête.
     * @param dto L'utilisateur trouvé dans le DAO
     * @param request La requête (nécessaire pour rajouter le header "Authorization" avec le token JWT via l'interceptor).
     * @throws NameNotFoundException Si le login de l'utilisateur ne correspond pas à un utilisateur existant
     * @throws MatchException Si la vérification des credentials de l'utilisateur a échoué.
     */
    public void login(LoginRequestDto dto, String origin, HttpServletRequest request) throws NameNotFoundException, AuthenticationException {
        User user = userDao.findOne(dto.login());
        user.authenticate(dto.password());

        request.setAttribute("generateToken", true);
        request.setAttribute("userLogin", user.getLogin());
    }

    /**
     * Méthode appelant la déconnexion dans le <code>ConnectionManager</code>.
     * @param username le login de l'utilisateur à déconnecter (supposé positionné dans les attributs de la requête)
     */
    public void logout(String username) {
        try {
            userDao.findOne(username).disconnect();
        } catch (NameNotFoundException ignored) {}
    }

    public boolean authenticate(String jwt, String origin) {
        return userTokenProvider.validateToken(jwt, origin);
    }
}
