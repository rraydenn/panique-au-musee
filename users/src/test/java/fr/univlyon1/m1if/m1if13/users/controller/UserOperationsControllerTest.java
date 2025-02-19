package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.LoginRequestDto;
import fr.univlyon1.m1if.m1if13.users.service.UserOperationService;
import fr.univlyon1.m1if.m1if13.users.util.UserTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.naming.AuthenticationException;
import javax.naming.NameNotFoundException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Tests unitaires pour le contrôleur UsersOperationsController.
 * Utilise Spring MockMVC pour simuler les requêtes HTTP et vérifier les réponses.
 */
@SpringBootTest
@AutoConfigureMockMvc
class UsersOperationsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserOperationService userOperationService;

    @MockitoBean
    private UserTokenProvider userTokenProvider;

    /** Teste la méthode login avec des identifiants valides.
     * Vérifie que la réponse HTTP est un code 204.
     */
    @Test
    void login_WithValidCredentials_ShouldReturn204() throws Exception {
        String loginJson = "{\"login\":\"testUser\",\"password\":\"password\"}";

        doNothing().when(userOperationService)
                .login(any(LoginRequestDto.class), anyString(), any(HttpServletResponse.class));

        mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isNoContent());
    }

    /** Teste la méthode login avec des identifiants invalides.
     * Vérifie que la réponse HTTP est un code 401.
     */
    @Test
    void login_WithInvalidCredentials_ShouldReturn401() throws Exception {
        String loginJson = "{\"login\":\"testUser\",\"password\":\"wrongpassword\"}";

        doThrow(new AuthenticationException("Invalid credentials"))
                .when(userOperationService)
                .login(any(LoginRequestDto.class), anyString(), any(HttpServletResponse.class));

        mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isUnauthorized());
    }

    /** Teste la méthode login avec un utilisateur inexistant.
     * Vérifie que la réponse HTTP est un code 404.
     */
    @Test
    void login_WithNonExistentUser_ShouldReturn404() throws Exception {
        String loginJson = "{\"login\":\"nonExistentUser\",\"password\":\"password\"}";

        doThrow(new NameNotFoundException("User not found"))
                .when(userOperationService)
                .login(any(LoginRequestDto.class), anyString(), any(HttpServletResponse.class));

        mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson)
                        .header("Origin", "http://localhost"))
                .andExpect(status().isNotFound());
    }

    /** Teste la déconnexion d'un utilisateur.
     * Vérifie que la réponse HTTP est un code 204.
     */
    @Test
    void logout_ShouldReturn204() throws Exception {
        when(userTokenProvider.isUserConnected(any(HttpServletRequest.class))).thenReturn(true);
        doAnswer(invocation -> {
            HttpServletRequest request = invocation.getArgument(0);
            request.setAttribute("username", "testUser");
            return true;
        }).when(userTokenProvider).isUserConnected(any(HttpServletRequest.class));
        doNothing().when(userOperationService).logout(anyString());

        mockMvc.perform(post("/logout")
                        .header("Authorization", "Bearer mock.jwt.token"))
                .andExpect(status().isNoContent());
    }


    /** Teste la méthode authenticate avec un token valide.
     * Vérifie que la réponse HTTP est un code 204.
     */
    @Test
    void authenticate_WithValidToken_ShouldReturn204() throws Exception {
        when(userOperationService.authenticate(anyString(), anyString())).thenReturn(true);

        mockMvc.perform(get("/authenticate")
                        .param("jwt", "valid.jwt.token")
                        .param("origin", "http://localhost"))
                .andExpect(status().isNoContent());
    }

    /** Teste la méthode authenticate avec des paramètres manquants.
     * Vérifie que la réponse HTTP est un code 400.
     */
    @Test
    void authenticate_WithMissingParameters_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/authenticate")
                        .param("jwt", "")
                        .param("origin", ""))
                .andExpect(status().isBadRequest());
    }

    /** Teste la méthode authenticate avec un token invalide.
     * Vérifie que la réponse HTTP est un code 401.
     */
    @Test
    void authenticate_WithInvalidToken_ShouldReturn401() throws Exception {
        when(userOperationService.authenticate(anyString(), anyString())).thenReturn(false);

        mockMvc.perform(get("/authenticate")
                        .param("jwt", "invalid.jwt.token")
                        .param("origin", "http://localhost"))
                .andExpect(status().isUnauthorized());
    }
}