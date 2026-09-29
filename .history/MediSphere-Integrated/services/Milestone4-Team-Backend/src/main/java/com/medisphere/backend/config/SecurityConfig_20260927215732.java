package com.medisphere.backend.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.medisphere.backend.security.JwtAuthFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/consent/verify").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/audit/logs").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")

                        // Static frontend (built React app) + SPA client-side routes.
                        // Everything under /api and /ws is deliberately excluded so those stay protected below.
                        .requestMatchers("/", "/index.html", "/assets/**", "/favicon.ico").permitAll()
                        .requestMatchers(HttpMethod.GET, "/{path:^(?!api|ws).*$}", "/{path:^(?!api|ws).*$}/**").permitAll()

                        // Role-based authorization for destructive/mutating operations.
                        // Patients: read for all authenticated; create/update for staff; delete for ADMIN only.
                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/patients", "/api/patients/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PUT, "/api/patients/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")

                        // Appointments: read for all authenticated; create/update/delete for staff (ADMIN/RECEPTIONIST/DOCTOR).
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.POST, "/api/appointments", "/api/appointments/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT")
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT")
                        .requestMatchers(HttpMethod.PATCH, "/api/appointments/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT")

                        // Twins: read-only for everyone authenticated; sync is a clinical/admin action.
                        .requestMatchers(HttpMethod.POST, "/api/twins/**").hasAnyRole("ADMIN", "DOCTOR")

                        // Predictions: running the model and deleting are clinical/admin actions.
                        .requestMatchers(HttpMethod.POST, "/api/predictions/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/predictions/**").hasAnyRole("ADMIN", "DOCTOR")

                        // Alerts: any staff can create/acknowledge; delete restricted to ADMIN.
                        .requestMatchers(HttpMethod.DELETE, "/api/alerts/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/alerts/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/api/alerts/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")

                        // Care plans: staff can create/update; ADMIN/DOCTOR can delete.
                        .requestMatchers(HttpMethod.DELETE, "/api/careplans/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/careplans", "/api/careplans/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.PUT, "/api/careplans/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/careplans/**").hasAnyRole("ADMIN", "DOCTOR")

                        // Reports: staff can generate/delete; everyone authenticated can read.
                        .requestMatchers(HttpMethod.POST, "/api/reports/**").hasAnyRole("ADMIN", "DOCTOR", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.DELETE, "/api/reports/**").hasAnyRole("ADMIN", "DOCTOR")

                        // Precision Care (Milestone 4): read-only for ADMIN/DOCTOR (the frontend
                        // page is gated to those roles, same as the ML console); every mutating
                        // action (approve/send plan, review guideline, post message, toggle task)
                        // is a clinical/admin action.
                        .requestMatchers(HttpMethod.GET, "/api/precision-care/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.POST, "/api/precision-care/**").hasAnyRole("ADMIN", "DOCTOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/precision-care/**").hasAnyRole("ADMIN", "DOCTOR")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Use allowedOriginPatterns (supports "*" WITH credentials) so the login
        // pre-flight (OPTIONS) isn't rejected with 403 when the frontend is hosted
        // on a different origin than the backend (e.g. Vercel -> Railway/Render).
        // Set CORS_ALLOWED_ORIGINS to restrict; defaults to the configured origin(s).
        config.setAllowedOriginPatterns(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
