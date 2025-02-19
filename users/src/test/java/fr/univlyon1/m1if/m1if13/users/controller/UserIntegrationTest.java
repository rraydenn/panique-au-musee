package fr.univlyon1.m1if.m1if13.users.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String ORIGIN = "http://localhost";
    private static final String TEST_USER_JSON = """
            {
                "login": "testUser",
                "password": "initialPassword",
                "species": "VOLEUR"
            }""";

    private static final String UPDATED_USER_JSON = """
            {
                "login": "testUser",
                "password": "newPassword",
                "species": "VOLEUR"
            }""";

    @Test
    void userLifecycleTest() throws Exception {
        // 1. Create user
        mockMvc.perform(post("/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TEST_USER_JSON)
                        .header("Origin", ORIGIN))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"));

        // 2. Login with initial password
        MvcResult loginResult = mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"testUser\",\"password\":\"initialPassword\"}")
                        .header("Origin", ORIGIN))
                .andExpect(status().isNoContent())
                .andExpect(header().exists("Authorization"))
                .andReturn();

        String token = loginResult.getResponse().getHeader("Authorization").replace("Bearer ", "");

        // 3. Verify token authentication
        mockMvc.perform(get("/authenticate")
                        .param("jwt", token)
                        .param("origin", ORIGIN))
                .andExpect(status().isNoContent());

        // 4. Update user password
        mockMvc.perform(put("/users/testUser")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(UPDATED_USER_JSON)
                        .header("Authorization", "Bearer " + token)
                        .header("Origin", ORIGIN))
                .andExpect(status().isNoContent());

        // 5. Try login with old password (should fail)
        mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"testUser\",\"password\":\"initialPassword\"}")
                        .header("Origin", ORIGIN))
                .andExpect(status().isUnauthorized());

        // 6. Try authentication with invalid token
        mockMvc.perform(get("/authenticate")
                        .param("jwt", "invalid.token")
                        .param("origin", ORIGIN))
                .andExpect(status().isUnauthorized());

        // 7. Login with new password
        MvcResult newLoginResult = mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"testUser\",\"password\":\"newPassword\"}")
                        .header("Origin", ORIGIN))
                .andExpect(status().isNoContent())
                .andExpect(header().exists("Authorization"))
                .andReturn();

        String newToken = newLoginResult.getResponse().getHeader("Authorization").replace("Bearer ", "");

        // 8. Get user information
        mockMvc.perform(get("/users/testUser")
                        .header("Authorization", "Bearer " + newToken)
                        .header("Origin", ORIGIN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value("testUser"))
                .andExpect(jsonPath("$.species").value("VOLEUR"));

        // 9. Logout user
        mockMvc.perform(post("/logout")
                        .header("Authorization", "Bearer " + newToken)
                        .header("Origin", ORIGIN))
                .andExpect(status().isNoContent());

        // 10. Try to get user info with expired token
        mockMvc.perform(get("/users/testUser")
                        .header("Authorization", "Bearer " + newToken)
                        .header("Origin", ORIGIN))
                .andExpect(status().isUnauthorized());

        // 11. Delete user
        mockMvc.perform(delete("/users/testUser")
                        .header("Origin", ORIGIN))
                .andExpect(status().isNoContent());

        // 12. Try to get deleted user info
        mockMvc.perform(get("/users/testUser")
                        .header("Origin", ORIGIN))
                .andExpect(status().isUnauthorized());
    }
}