package com.campusos.backend.controller;

import com.campusos.backend.dto.LoginRequest;
import com.campusos.backend.dto.LoginResponse;
import com.campusos.backend.dto.RegisterRequest;
import com.campusos.backend.enums.Role;
import com.campusos.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.campusos.backend.dto.AuthMeResponse;
import com.campusos.backend.dto.ChangePasswordRequest;
import com.campusos.backend.dto.LastRouteRequest;
import com.campusos.backend.dto.LastRouteResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/student")
    public ResponseEntity<String> registerStudent(@RequestBody RegisterRequest request) {

        authService.register(request, Role.STUDENT);

        return ResponseEntity.ok("Student Registered Successfully");
    }

    @PostMapping("/register/teacher")
    public ResponseEntity<String> registerTeacher(@RequestBody RegisterRequest request) {

        authService.register(request, Role.TEACHER);

        return ResponseEntity.ok("Teacher Registered Successfully");
    }

    @PostMapping("/register/principal")
    public ResponseEntity<String> registerPrincipal(@RequestBody RegisterRequest request) {

        authService.register(request, Role.PRINCIPAL);

        return ResponseEntity.ok("Principal Registered Successfully");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@AuthenticationPrincipal String email,
                                                 @RequestBody ChangePasswordRequest request) {
        authService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully.");
    }

    @GetMapping("/me")
    public ResponseEntity<AuthMeResponse> me(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.getCurrentUser(email));
    }

    @GetMapping("/principal-exists")
    public ResponseEntity<Boolean> principalExists() {
        return ResponseEntity.ok(authService.principalExists());
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.refresh(email));
    }

    @DeleteMapping("/me")
    public ResponseEntity<String> deleteOwnAccount(@AuthenticationPrincipal String email) {
        authService.deleteOwnAccount(email);
        return ResponseEntity.ok("Principal account and college data deleted. System reset.");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/last-route")
    public ResponseEntity<LastRouteResponse> lastRoute(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(new LastRouteResponse(authService.getLastRoute(email)));
    }

    @PutMapping("/last-route")
    public ResponseEntity<String> saveLastRoute(
            @AuthenticationPrincipal String email,
            @RequestBody LastRouteRequest request) {
        authService.saveLastRoute(email, request.route());
        return ResponseEntity.ok("Saved");
    }
}