package com.campusos.backend.controller;

import com.campusos.backend.dto.ProfileResponse;
import com.campusos.backend.dto.ProfileUpdateRequest;
import com.campusos.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final AuthService authService;
    public ProfileController(AuthService authService) { this.authService = authService; }

    @GetMapping
    public ResponseEntity<ProfileResponse> get(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.getProfile(email));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> update(@AuthenticationPrincipal String email,
                                                   @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(authService.updateProfile(email, request));
    }
}
