package fr.univlyon1.m1if.m1if13.users.filter;

import fr.univlyon1.m1if.m1if13.users.util.UrlDecomposer;
import fr.univlyon1.m1if.m1if13.users.util.UserTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.stream.Stream;

/**
 * Filtre d'autorisation.
 * Vérifie que l'utilisateur authentifié a le droit d'accéder à certaines ressources.
 * Renvoie un code 403 (Forbidden) sinon.
 *
 * @author Lionel Médini
 */
@Component
@Order(2)
@WebFilter
public class AuthorizationFilter extends HttpFilter {
    @Autowired
    private UserTokenProvider userTokenProvider;

    // Liste des ressources pour lesquelles renvoyer un 403 si l'utilisateur n'est pas le bon
    private static final String[][] RESOURCES_WITH_AUTHORIZATION = {
            {"PUT", "users", "*"},
            {"GET", "users", "*"}
    };

    public void init(FilterConfig config) throws ServletException {
        super.init(config);
    }

    @Override
    @SuppressWarnings("unchecked")
    public void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        // Si l'utilisateur n'est pas authentifié (mais que la requête a passé le filtre d'authentification), c'est que ce filtre est sans objet
        if(!userTokenProvider.isUserConnected(request)) {
            chain.doFilter(request, response);
            return;
        }

        String[] url = UrlDecomposer.getUrlParts(request);

        // Application du filtre
        if (Stream.of(RESOURCES_WITH_AUTHORIZATION).anyMatch(pattern -> UrlDecomposer.matchRequest(request, pattern))) {
            String userId = (String) request.getAttribute("username");
            if (url[0].equals("users")) {
                if (url[1].equals(userId)) {
                    chain.doFilter(request, response);
                } else {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Vous n'avez pas accès aux informations de cet utilisateur.");
                }
            } else {
                chain.doFilter(request, response); // On laisse Tomcat générer un 404.
            }
        } else {
            chain.doFilter(request, response);
        }
    }
}
