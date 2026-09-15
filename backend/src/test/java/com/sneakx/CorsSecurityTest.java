package com.sneakx;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
public class CorsSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("CORS: Preflight OPTIONS on authenticated /api/wishlist permits https://sneakx-frontend.onrender.com")
    void testPreflightWishlistFromProductionFrontend() throws Exception {
        mockMvc.perform(options("/api/wishlist")
                        .header("Origin", "https://sneakx-frontend.onrender.com")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://sneakx-frontend.onrender.com"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("CORS: Preflight OPTIONS on authenticated /api/cart permits http://localhost:5173")
    void testPreflightCartFromLocalhost() throws Exception {
        mockMvc.perform(options("/api/cart")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("CORS: GET /api/products/featured includes Access-Control-Allow-Origin for production frontend")
    void testGetFeaturedProductsCors() throws Exception {
        mockMvc.perform(get("/api/products/featured")
                        .header("Origin", "https://sneakx-frontend.onrender.com"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://sneakx-frontend.onrender.com"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("CORS: Wildcard Render pattern matching allows custom onrender domains")
    void testWildcardRenderDomain() throws Exception {
        mockMvc.perform(options("/api/products/1")
                        .header("Origin", "https://sneakx-frontend-preview.onrender.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://sneakx-frontend-preview.onrender.com"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }
}
