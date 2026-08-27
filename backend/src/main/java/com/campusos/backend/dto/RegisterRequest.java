package com.campusos.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {

    // User Information
    private String firstName;
    private String lastName;
    private String email;
    private String password;

    // Student Information
    private String enrollmentNumber;
    private Integer rollNumber;
    private Integer semester;
    private Integer admissionYear;

    private Long departmentId;
}
