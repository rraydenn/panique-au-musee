package fr.univlyon1.m1if.m1if13.users.filter;

import fr.univlyon1.m1if.m1if13.users.util.UserTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Filtre d'authentification.
 * N'autorise l'accès qu'aux clients déjà connectés ou ayant rempli le formulaire de la page <code>index.html</code>.
 * Dans ce dernier cas, le filtre crée la session / génère le token de l'utilisateur, crée un objet User et l'ajoute en attribut de la session.
 * Laisse toutefois passer les URLs "/" et "/index.html".
 */
@Component
@Order(1)
@WebFilter
public class AuthenticationFilter extends HttpFilter {
    @Autowired
    private UserTokenProvider userTokenProvider;

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {
        // Permet de retrouver la fin de l'URL (après l'URL du contexte) -> indépendant de l'URL de déploiement
        String url = request.getRequestURI().replace(request.getContextPath(), "");

        // Laisse passer les URLs ne nécessitant pas d'authentification et les requêtes par des utilisateurs authentifiés
        if(
                (request.getMethod().equals("OPTIONS")) ||
                url.equals("/users")  ||
                (url.startsWith("/users/") && request.getMethod().equals("DELETE")) ||
                (url.equals("/login") && request.getMethod().equals("POST")) ||
                (url.equals("/authenticate") && request.getMethod().equals("GET")) ||
                userTokenProvider.isUserConnected(request)
        ) {
            chain.doFilter(request, response);
            return;
        }

        // Bloque les autres requêtes
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Vous devez vous connecter pour accéder au site.");
    }
}
