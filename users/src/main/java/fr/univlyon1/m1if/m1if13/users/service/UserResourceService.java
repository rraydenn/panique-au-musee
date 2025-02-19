package fr.univlyon1.m1if.m1if13.users.service;

import fr.univlyon1.m1if.m1if13.users.dto.UserResponseDto;
import fr.univlyon1.m1if.m1if13.users.dto.UsersResponseDto;
import fr.univlyon1.m1if.m1if13.users.dto.LinkDto;
import fr.univlyon1.m1if.m1if13.users.model.User;
import fr.univlyon1.m1if.m1if13.users.dao.UserDao;
import fr.univlyon1.m1if.m1if13.users.util.UserTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.naming.NameAlreadyBoundException;
import javax.naming.NameNotFoundException;
import java.net.URI;
import java.util.Collection;

/**
 * Méthodes de service du contrôleur de ressources sur les utilisateurs.
  */
@Service
public class UserResourceService {

    @Autowired
    private UserDao userDao;

    public Collection<User> getAllUsers() {
        return userDao.findAll();
    }

    public UsersResponseDto getAllUsersDto() {
        return new UsersResponseDto(userDao
                .findAll().stream()
                .map(User::getLogin)
                .map(s -> "users/" + s)
                .map(LinkDto::new)
                .toList()
        );
    }

    public URI createUser(User user) throws NameAlreadyBoundException {
        userDao.add(user);
        return URI.create("users/" + user.getLogin());
    }

    public UserResponseDto getUser(String login) throws NameNotFoundException {
        return UserResponseDto.of(userDao.findOne(login));
    }

    public void updateUser(String login, User user, String origin, HttpServletRequest request) {
        userDao.update(login, user);
        request.setAttribute("generateToken", true);
        request.setAttribute("userLogin", user.getLogin());
    }

    public void deleteUser(String login) throws NameNotFoundException {
        userDao.deleteById(login);
    }
}
