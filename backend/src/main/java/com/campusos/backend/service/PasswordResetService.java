package com.campusos.backend.service;

import com.campusos.backend.entity.User;
import com.campusos.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, OtpEntry> otps = new ConcurrentHashMap<>();
    private final RestClient restClient = RestClient.create();

    // Reused as the verified Brevo sender address - same Gmail address as before,
    // just no longer connected to via SMTP (Render blocks that outbound).
    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    public PasswordResetService(UserRepository userRepository,
                                BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void sendOtp(String email) {
        String normalized = normalize(email);
        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new IllegalArgumentException("No account is registered with this email."));

        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            throw new IllegalStateException(
                    "Email sending is not configured. Set BREVO_API_KEY in the backend environment.");
        }
        if (senderEmail == null || senderEmail.isBlank()) {
            throw new IllegalStateException(
                    "Sender email is not configured. Set MAIL_USERNAME in the backend environment.");
        }

        String otp = String.format("%06d", random.nextInt(1_000_000));
        otps.put(normalized, new OtpEntry(otp, Instant.now().plusSeconds(600), 0));

        try {
            Map<String, Object> body = Map.of(
                    "sender", Map.of("name", "CampusOS", "email", senderEmail),
                    "to", java.util.List.of(Map.of("email", user.getEmail())),
                    "subject", "CampusOS Password Reset OTP",
                    "htmlContent",
                    "<h2>CampusOS Password Reset</h2>" +
                    "<p>Your one-time verification code is:</p>" +
                    "<p style='font-size:28px;font-weight:bold;letter-spacing:8px'>" + otp + "</p>" +
                    "<p>This OTP expires in 10 minutes. If you did not request a password reset, ignore this email.</p>"
            );

            restClient.post()
                    .uri("https://api.brevo.com/v3/smtp/email")
                    .header("api-key", brevoApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {
            otps.remove(normalized);
            String detail = e.getMessage() == null ? "Unknown error." : e.getMessage();
            throw new IllegalStateException(
                    "Unable to send OTP email. Check BREVO_API_KEY and that the sender email is "
                            + "verified in Brevo. Details: " + detail);
        }
    }

    public void verifyOtp(String email, String otp) {
        requireValid(normalize(email), otp);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        String normalized = normalize(email);
        requireValid(normalized, otp);
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must contain at least 8 characters.");
        }
        User user = userRepository.findByEmail(normalized)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otps.remove(normalized);
    }

    private void requireValid(String email, String otp) {
        OtpEntry entry = otps.get(email);
        if (entry == null || entry.expiresAt().isBefore(Instant.now())) {
            otps.remove(email);
            throw new IllegalArgumentException("OTP is invalid or expired.");
        }
        if (!entry.otp().equals(otp)) {
            int attempts = entry.attempts() + 1;
            if (attempts >= 5) {
                otps.remove(email);
                throw new IllegalArgumentException("Too many incorrect OTP attempts. Request a new OTP.");
            }
            otps.put(email, new OtpEntry(entry.otp(), entry.expiresAt(), attempts));
            throw new IllegalArgumentException("Incorrect OTP.");
        }
    }

    private String normalize(String email) {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Email is required.");
        return email.trim().toLowerCase();
    }

    private record OtpEntry(String otp, Instant expiresAt, int attempts) {}
}