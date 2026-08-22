package com.campusos.backend.dto;

public record ProfileUpdateRequest(
        String firstName,
        String lastName,
        String email,
        String phone
) {}
