package com.mydiet.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Enable Spring Security CORS support (Resolves OPTIONS preflight errors)
                .cors(Customizer.withDefaults())
                // Disable CSRF protection
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Unconditionally permit all OPTIONS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Whitelist for normal endpoints
                        .requestMatchers(
                                "/",
                                "/error",
                                "/auth/**",
                                "/api/users/**",
                                "/api/posts/**",
                                "/api/recipes/**",
                                "/api/dietary-references/**",
                                "/api/meal-plan/**",
                                "/oauth2/**",
                                "/login/**",
                                "/api/**" // CRITICAL PATCH: Allow all community data endpoints!
                        ).permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    // Configure global CORS rules
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); 
        configuration.setAllowedHeaders(Arrays.asList("*")); 
        configuration.setAllowCredentials(true); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}