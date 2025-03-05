package fr.univlyon1.m1if.m1if13.users.config;

import fr.univlyon1.m1if.m1if13.users.model.User;
import fr.univlyon1.m1if.m1if13.users.dao.UserDao;
import fr.univlyon1.m1if.m1if13.users.util.UserTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/**
 * Interceptor pour générer un token JWT.
 * */
@Component
public class GenerateTokenInterceptor implements HandlerInterceptor {
    @Autowired
    private UserTokenProvider userTokenProvider;

    @Autowired
    private UserDao userDao;

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
        if (request.getAttribute("generateToken") != null &&
            request.getAttribute("userLogin") != null &&
            request.getHeader("Origin") != null) {

            String userLogin = (String) request.getAttribute("userLogin");
            String origin = request.getHeader("Origin");

            try {
                User user = userDao.findOne(userLogin);
                if(user.isConnected()) {
                    String token = userTokenProvider.generateToken(user, origin);
                    response.setHeader("Authorization", "Bearer " + token);
                }
            } catch (Exception ignored) { }
        }
    }
}
