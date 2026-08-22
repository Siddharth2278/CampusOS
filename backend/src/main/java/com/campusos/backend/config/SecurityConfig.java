package com.campusos.backend.config;

import com.campusos.backend.security.JwtAuthenticationFilter;
import com.campusos.backend.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {
    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .userDetailsService(userDetailsService)
            .exceptionHandling(ex -> ex
                // Without these, a missing/expired token or a role check that
                // fails returns Spring's default empty/whitelabel body — the
                // frontend has nothing to display even though it wants to.
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(401);
                    response.setContentType("text/plain");
                    response.getWriter().write("Please log in again.");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(403);
                    response.setContentType("text/plain");
                    response.getWriter().write("You don't have permission to do that.");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // CORS preflight requests never carry an Authorization header.
                // Without this exemption, every authenticated cross-origin
                // request (i.e. almost everything, since they all send a
                // Bearer token) has its browser preflight rejected by the
                // "authenticated"/role rules below before it ever reaches a
                // controller — the request never even fails visibly, it just
                // never arrives.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/register/**", "/api/auth/forgot-password/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/departments").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/colleges").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/change-password").authenticated()
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/teachers").hasAnyRole("PRINCIPAL","HOD")
                .requestMatchers(HttpMethod.GET, "/api/teachers/hod-candidates").hasRole("PRINCIPAL")
                .requestMatchers(HttpMethod.GET, "/api/students").hasAnyRole("PRINCIPAL","HOD","TEACHER")
                .requestMatchers(HttpMethod.POST, "/api/departments/**").hasRole("PRINCIPAL")
                .requestMatchers(HttpMethod.POST, "/api/subjects/**").hasRole("HOD")
                .requestMatchers(HttpMethod.PUT, "/api/subjects/**").hasRole("HOD")
                .requestMatchers(HttpMethod.DELETE, "/api/subjects/**").hasRole("HOD")
                .requestMatchers(HttpMethod.PUT, "/api/teachers/*/make-hod").hasRole("PRINCIPAL")
                .requestMatchers(HttpMethod.POST, "/api/students/by-teacher/**").hasAnyRole("TEACHER", "HOD")
                .requestMatchers(HttpMethod.POST, "/api/faculty-assignments/**").hasRole("HOD")
                .requestMatchers(HttpMethod.PUT, "/api/faculty-assignments/**").hasRole("HOD")
                .requestMatchers(HttpMethod.DELETE, "/api/faculty-assignments/**").hasRole("HOD")
                .requestMatchers(HttpMethod.POST, "/api/timetable/**").hasRole("HOD")
                .requestMatchers(HttpMethod.PUT, "/api/timetable/**").hasRole("HOD")
                .requestMatchers(HttpMethod.DELETE, "/api/timetable/**").hasRole("HOD")
                .requestMatchers(HttpMethod.POST, "/api/leaves").hasAnyRole("STUDENT","TEACHER","HOD")
                .requestMatchers(HttpMethod.GET, "/api/leaves/my/**").hasAnyRole("STUDENT","TEACHER","HOD")
                .requestMatchers(HttpMethod.GET, "/api/leaves/statistics/**").hasAnyRole("STUDENT","TEACHER","HOD")
                .requestMatchers(HttpMethod.GET, "/api/leaves/class-teacher/pending").hasAnyRole("TEACHER","HOD")
                .requestMatchers(HttpMethod.GET, "/api/leaves/hod/pending").hasRole("HOD")
                .requestMatchers(HttpMethod.GET, "/api/leaves/principal/pending").hasRole("PRINCIPAL")
                .requestMatchers(HttpMethod.PUT, "/api/leaves/*/decision").hasAnyRole("TEACHER","HOD","PRINCIPAL")
                .requestMatchers(HttpMethod.POST, "/api/attendance/**").hasAnyRole("TEACHER", "HOD")
                .requestMatchers(HttpMethod.GET, "/api/attendance/**").hasAnyRole("STUDENT", "TEACHER", "HOD")
                .requestMatchers(HttpMethod.POST, "/api/assignments/**").hasAnyRole("TEACHER", "HOD")
                .requestMatchers(HttpMethod.GET, "/api/assignments/**").hasAnyRole("STUDENT","TEACHER","HOD")
                .requestMatchers(HttpMethod.PUT, "/api/assignment-submissions/*/status").hasAnyRole("TEACHER", "HOD")
                .requestMatchers(HttpMethod.POST, "/api/exams/**").hasAnyRole("PRINCIPAL", "HOD")
                .requestMatchers(HttpMethod.PUT, "/api/exams/**").hasAnyRole("PRINCIPAL", "HOD")
                .requestMatchers(HttpMethod.DELETE, "/api/exams/**").hasAnyRole("PRINCIPAL", "HOD")
                .requestMatchers(HttpMethod.GET, "/api/approvals/teachers").hasAnyRole("PRINCIPAL","HOD")
                .requestMatchers(HttpMethod.PUT, "/api/approvals/teachers/*").hasAnyRole("PRINCIPAL","HOD")
                .requestMatchers(HttpMethod.GET, "/api/approvals/students").hasAnyRole("TEACHER","HOD")
                .requestMatchers(HttpMethod.PUT, "/api/approvals/students/*").hasAnyRole("TEACHER","HOD")
                .requestMatchers(HttpMethod.PUT, "/api/approvals/teachers/*/promote-hod").hasRole("PRINCIPAL")
                .requestMatchers(HttpMethod.PUT, "/api/teachers/*/class-teacher").hasRole("HOD")
                .requestMatchers(HttpMethod.POST, "/api/notices/**").hasAnyRole("TEACHER","HOD","PRINCIPAL")
                .requestMatchers(HttpMethod.PUT, "/api/notices/**").hasAnyRole("TEACHER","HOD","PRINCIPAL")
                .requestMatchers(HttpMethod.DELETE, "/api/notices/**").hasAnyRole("TEACHER","HOD","PRINCIPAL")
                .requestMatchers(HttpMethod.POST, "/api/academic-calendar/**").hasRole("PRINCIPAL")
                .requestMatchers("/api/dashboard/student/**").hasRole("STUDENT")
                .requestMatchers("/api/dashboard/teacher/**").hasAnyRole("TEACHER", "HOD")
                .requestMatchers("/api/dashboard/hod").hasRole("HOD")
                .requestMatchers("/api/dashboard/principal").hasRole("PRINCIPAL")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
