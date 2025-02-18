package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.UserResponseDto;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

    @Test
    void getUser_ShouldReturn200() throws Exception {
        when(userResourceService.getUser("testUser")).thenReturn(UserResponseDto.of(testUser));

        mockMvc.perform(get("/users/testUser")
                        .header("Authorization", "Bearer mock.jwt.token")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void createUser_ShouldReturn201() throws Exception {
        String userJson = "{\"login\":\"testUser\",\"password\":\"password\",\"species\":\"VOLEUR\"}";

        when(userResourceService.createUser(any(User.class)))
                .thenReturn(java.net.URI.create("users/testUser"));

        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(userJson))
                .andExpect(status().isCreated());
    }

    @Test
    void deleteUser_ShouldReturn204() throws Exception {
        mockMvc.perform(delete("/users/testUser")
                        .header("Authorization", "Bearer mock.jwt.token"))
                .andExpect(status().isNoContent());
    }
}