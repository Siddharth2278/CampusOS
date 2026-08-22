package com.campusos.backend.controller;

import com.campusos.backend.dto.*;
import com.campusos.backend.service.PasswordResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/forgot-password")
public class PasswordResetController {
    private final PasswordResetService service;
    public PasswordResetController(PasswordResetService service) { this.service = service; }

    @PostMapping("/request-otp")
    public ResponseEntity<ForgotPasswordOtpResponse> requestOtp(@RequestBody ForgotPasswordOtpRequest request) {
        service.sendOtp(request.email());
        return ResponseEntity.ok(new ForgotPasswordOtpResponse("OTP sent to your registered email."));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ForgotPasswordOtpResponse> verifyOtp(@RequestBody VerifyOtpRequest request) {
        service.verifyOtp(request.email(), request.otp());
        return ResponseEntity.ok(new ForgotPasswordOtpResponse("OTP verified."));
    }

    @PostMapping("/reset")
    public ResponseEntity<ForgotPasswordOtpResponse> reset(@RequestBody ResetPasswordRequest request) {
        service.resetPassword(request.email(), request.otp(), request.newPassword());
        return ResponseEntity.ok(new ForgotPasswordOtpResponse("Password reset successfully."));
    }
}
