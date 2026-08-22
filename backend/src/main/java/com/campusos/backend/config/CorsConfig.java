package com.campusos.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS policy for the whole API.
 *
 * Several controllers already had their own @CrossOrigin("*"), but many
 * others (AuthController, StudentController, TeacherController,
 * DepartmentController, SubjectController, FacultyAssignmentController,
 * ExamController, AssignmentController, AssignmentSubmissionController,
 * NotificationController) had none, so browser requests to those endpoints
 * — including login — were being blocked by CORS. This covers every
 * endpoint in one place instead of relying on per-controller annotations.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }
}
