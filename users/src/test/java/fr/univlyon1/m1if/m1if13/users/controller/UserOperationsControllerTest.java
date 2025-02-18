package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.LoginRequestDto;
import fr.univlyon1.m1if.m1if13.users.service.UserOperationService;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.naming.AuthenticationException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UsersOperationsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserOperationService userOperationService;

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

    @Test
    void authenticate_WithValidToken_ShouldReturn204() throws Exception {
        when(userOperationService.authenticate(anyString(), anyString())).thenReturn(true);

        mockMvc.perform(get("/authenticate")
                        .param("jwt", "valid.jwt.token")
                        .param("origin", "http://localhost"))
                .andExpect(status().isNoContent());
    }

    @Test
    void authenticate_WithInvalidToken_ShouldReturn401() throws Exception {
        when(userOperationService.authenticate(anyString(), anyString())).thenReturn(false);

        mockMvc.perform(get("/authenticate")
                        .param("jwt", "invalid.jwt.token")
                        .param("origin", "http://localhost"))
                .andExpect(status().isUnauthorized());
    }
}