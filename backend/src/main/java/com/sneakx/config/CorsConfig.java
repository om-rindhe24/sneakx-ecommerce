package com.sneakx.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.*;

@Configuration
public class CorsConfig {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    @Value("${app.frontend.url:}")
    private String appFrontendUrl;

    @Value("${FRONTEND_URL:}")
    private String envFrontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        Set<String> origins = new LinkedHashSet<>();

        // 1. Production frontend origins
        origins.add("https://sneakx-frontend.onrender.com");

        // 2. Local development origins
        origins.add("http://localhost:5173");
        origins.add("http://localhost:3000");
        origins.add("http://localhost:4173");
        origins.add("http://127.0.0.1:5173");
        origins.add("http://127.0.0.1:3000");

        // 3. Dynamic origins from environment variables and application properties
        addOrigins(origins, System.getenv("FRONTEND_URL"));
        addOrigins(origins, envFrontendUrl);
        addOrigins(origins, appFrontendUrl);

        config.setAllowedOrigins(new ArrayList<>(origins));

        // 4. Pattern matching for Render subdomains and localhost ports
        config.setAllowedOriginPatterns(Arrays.asList(
                "https://*.onrender.com",
                "https://*.vercel.app",
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));

        // 5. Allowed HTTP methods, headers, and exposed headers
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(Collections.singletonList("*"));
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Total-Count", "Link"));
        config.setMaxAge(3600L);

        log.info("[CORS] Configured allowed origins: {}", origins);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public CorsFilter corsFilter(CorsConfigurationSource corsConfigurationSource) {
        return new CorsFilter(corsConfigurationSource);
    }

    private void addOrigins(Set<String> origins, String raw) {
        if (raw == null || raw.trim().isEmpty()) return;
        for (String part : raw.split(",")) {
            String origin = part.trim();
            if (origin.endsWith("/")) {
                origin = origin.substring(0, origin.length() - 1);
            }
            if (!origin.isEmpty()) {
                origins.add(origin);
            }
        }
    }
}

