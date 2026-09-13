package com.sneakx;

import com.sneakx.security.JwtTokenProvider;
import com.sneakx.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("h2")
public class JwtTokenProviderTest {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private Authentication createTestAuthentication(Long userId, String email, String firstName, String lastName, String role) {
        UserPrincipal principal = new UserPrincipal(
                userId,
                email,
                "passwordHash",
                firstName,
                lastName,
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
        return new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("Should generate and validate JWT token using default fallback secret")
    void testTokenGenerationAndValidationWithDefaultSecret() {
        Authentication auth = createTestAuthentication(100L, "collector@sneakx.com", "Collector", "Sneak", "ROLE_CUSTOMER");

        String token = jwtTokenProvider.generateToken(auth);
        assertNotNull(token);
        assertFalse(token.isEmpty());

        boolean isValid = jwtTokenProvider.validateToken(token);
        assertTrue(isValid, "Token should be valid when signed with default secret");

        Long extractedUserId = jwtTokenProvider.getUserIdFromJWT(token);
        assertEquals(100L, extractedUserId);
    }

    @Test
    @DisplayName("Should reject malformed or tampered token")
    void testRejectMalformedToken() {
        assertFalse(jwtTokenProvider.validateToken("malformed.jwt.token"));
        assertFalse(jwtTokenProvider.validateToken(""));
        assertFalse(jwtTokenProvider.validateToken(null));
    }

    @Test
    @DisplayName("Should support custom JWT_SECRET environment variable override")
    void testCustomJwtSecretOverride() {
        String defaultSecret = (String) ReflectionTestUtils.getField(jwtTokenProvider, "jwtSecret");

        try {
            // Simulate environment variable override: JWT_SECRET="CustomProductionSecretKeyMustBe32BytesMinLength!!"
            String customSecret = "CustomProductionSecretKeyMustBe32BytesMinLength!!";
            JwtTokenProvider customProvider = new JwtTokenProvider();
            ReflectionTestUtils.setField(customProvider, "jwtSecret", customSecret);
            ReflectionTestUtils.setField(customProvider, "jwtExpirationInMs", 3600000);

            Authentication auth = createTestAuthentication(200L, "admin@sneakx.com", "Admin", "User", "ROLE_ADMIN");
            String customToken = customProvider.generateToken(auth);

            assertNotNull(customToken);
            assertTrue(customProvider.validateToken(customToken), "Custom provider should validate token signed with custom secret");
            assertEquals(200L, customProvider.getUserIdFromJWT(customToken));

            // Token signed with custom secret should FAIL validation on provider with default secret
            assertFalse(jwtTokenProvider.validateToken(customToken), "Provider with different secret must reject foreign token");
        } finally {
            ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", defaultSecret);
        }
    }
}
