package com.campusos.backend.dto;

public record ResetPasswordRequest(String email, String otp, String newPassword) {}
