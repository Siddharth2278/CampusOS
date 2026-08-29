package com.campusos.backend.controller;

import com.campusos.backend.dto.ProfileResponse;
import com.campusos.backend.dto.ProfileUpdateRequest;
import com.campusos.backend.service.AuthService;
import com.campusos.backend.service.CloudinaryService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final AuthService authService;
    private final CloudinaryService cloudinaryService;

    public ProfileController(AuthService authService, CloudinaryService cloudinaryService) {
        this.authService = authService;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> get(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.getProfile(email));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> update(@AuthenticationPrincipal String email,
                                                   @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(authService.updateProfile(email, request));
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> uploadPhoto(@AuthenticationPrincipal String email,
                                                        @RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) throw new RuntimeException("No file provided.");
        if (file.getSize() > 5 * 1024 * 1024) throw new RuntimeException("Photo must be 5MB or smaller.");
        String url = cloudinaryService.upload(file, "campusos/profiles");
        return ResponseEntity.ok(authService.updatePhoto(email, url));
    }

    @DeleteMapping("/photo")
    public ResponseEntity<ProfileResponse> removePhoto(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.removePhoto(email));
    }
}
