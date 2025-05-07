package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.UserResponseDto;
import fr.univlyon1.m1if.m1if13.users.dto.UsersResponseDto;
import fr.univlyon1.m1if.m1if13.users.model.Species;
import fr.univlyon1.m1if.m1if13.users.model.User;
import fr.univlyon1.m1if.m1if13.users.service.UserResourceService;
import fr.univlyon1.m1if.m1if13.users.util.UserTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import javax.naming.NameAlreadyBoundException;
import javax.naming.NameNotFoundException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests unitaires pour le contrôleur UserResourceController.
 * Utilise Spring MockMVC pour simuler les requêtes HTTP et vérifier les réponses.
 */
@SpringBootTest
@AutoConfigureMockMvc
class UserResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserResourceService userResourceService;

    @MockitoBean
    private UserTokenProvider userTokenProvider;

    private User testUser;

    /**
     * Configuration initiale avant chaque test.
     * Prépare un utilisateur de test et configure les comportements par défaut des mocks.
     */
    @BeforeEach
    void setUp() {
        testUser = new User("testUser", "password", Species.VOLEUR, "image.png");

        when(userTokenProvider.isUserConnected(any(HttpServletRequest.class))).thenReturn(true);
        when(userTokenProvider.validateToken(anyString(), anyString())).thenReturn(true);
        when(userTokenProvider.extractUsername(anyString())).thenReturn("testUser");

        doAnswer(invocation -> {
            HttpServletRequest request = invocation.getArgument(0);
            request.setAttribute("username", "testUser");
            return true;
        }).when(userTokenProvider).isUserConnected(any(HttpServletRequest.class));
    }

    /**
     * Test de récupération de la liste des utilisateurs.
     * Vérifie que le code 200 est renvoyé avec la liste au format JSON.
     */
    @Test
    void getAllUsersShouldReturn200AndUsersList() throws Exception {
        when(userResourceService.getAllUsersDto()).thenReturn(new UsersResponseDto(java.util.Collections.emptyList()));

        mockMvc.perform(get("/users")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON));
    }

    /**
     * Test de création d'un utilisateur avec succès.
     * Vérifie que le code de statut 201 est renvoyé avec l'URI de la ressource créée.
     */
    @Test
    void createUserShouldReturn201() throws Exception {
        String userJson = "{\"login\":\"testUser\",\"password\":\"password\",\"species\":\"VOLEUR\"}";

        when(userResourceService.createUser(any(User.class)))
                .thenReturn(java.net.URI.create("users/testUser"));

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"));
    }

    /**
     * Test de création d'un utilisateur avec un login déjà existant.
     * Vérifie que le code 409 (Conflict) est renvoyé.
     */
    @Test
    void createUserWithExistingLoginShouldReturn409() throws Exception {
        String userJson = "{\"login\":\"testUser\",\"password\":\"password\",\"species\":\"VOLEUR\"}";
        when(userResourceService.createUser(any(User.class)))
                .thenThrow(new NameAlreadyBoundException("User already exists"));

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isConflict());
    }

    /**
     * Test de récupération d'un utilisateur avec succès.
     * Vérifie que la réponse contient les bonnes informations et le bon code HTTP.
     */
    @Test
    void getUserShouldReturn200AndCorrectContent() throws Exception {
        UserResponseDto expectedUser = new UserResponseDto("testUser", Species.VOLEUR, "12.png");
        when(userResourceService.getUser("testUser")).thenReturn(expectedUser);

        mockMvc.perform(get("/users/testUser")
                        .header("Authorization", "Bearer mock.jwt.token")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.login").value("testUser"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.species").value("VOLEUR"));
    }

    /**
     * Test de récupération d'un utilisateur inexistant.
     * Vérifie que le code 404 (Not Found) est renvoyé.
     */
    @Test
    void getUserWhenUserDoesNotExistShouldReturn404() throws Exception {
        when(userResourceService.getUser("nonexistent"))
                .thenThrow(new NameNotFoundException("User not found"));

        when(userTokenProvider.isUserConnected(any(HttpServletRequest.class))).thenReturn(true);
        doAnswer(invocation -> {
            HttpServletRequest request = invocation.getArgument(0);
            request.setAttribute("username", "nonexistent");
            return true;
        }).when(userTokenProvider).isUserConnected(any(HttpServletRequest.class));

        mockMvc.perform(get("/users/nonexistent")
                        .header("Authorization", "Bearer mock.jwt.token")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    /**
     * Test de mise à jour d'un utilisateur avec succès.
     * Vérifie que le code 201 est renvoyé.
     */
    @Test
    void updateUserShouldReturn201() throws Exception {
        String userJson = "{\"login\":\"testUser\",\"password\":\"newpass\",\"species\":\"POLICIER\"}";

        mockMvc.perform(put("/users/testUser")
                        .header("Authorization", "Bearer mock.jwt.token")
                        .header("Origin", "http://localhost")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isCreated());
    }

    /**
     * Test de mise à jour d'un utilisateur sans modification.
     * Vérifie que le code 204 (No Content) est renvoyé.
     */
    @Test
    void updateUserWithoutChangesShouldReturn204() throws Exception {
        String userJson = "{\"login\":\"testUser\",\"password\":\"password\",\"species\":\"VOLEUR\"}";

        when(userResourceService.createUser(any(User.class)))
                .thenThrow(new NameAlreadyBoundException("User already exists"));

        mockMvc.perform(put("/users/testUser")
                        .header("Authorization", "Bearer mock.jwt.token")
                        .header("Origin", "http://localhost")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isNoContent());
    }

    /**
     * Test de suppression d'un utilisateur avec succès.
     * Vérifie que le code 204 est renvoyé.
     */
    @Test
    void deleteUserShouldReturn204() throws Exception {
        mockMvc.perform(delete("/users/testUser")
                        .header("Authorization", "Bearer mock.jwt.token"))
                .andExpect(status().isNoContent());
    }
}
