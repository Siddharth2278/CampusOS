package com.campusos.backend.dto;

import com.campusos.backend.enums.Role;

public record ProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phone,
        Role role,
        Long departmentId,
        Integer semester,
        String photoUrl
) {}
