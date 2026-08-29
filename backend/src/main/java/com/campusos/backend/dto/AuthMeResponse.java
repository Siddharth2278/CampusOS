package com.campusos.backend.dto;

import com.campusos.backend.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthMeResponse {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Long profileId;
    private Long departmentId;
    private Integer semester;
    private String photoUrl;
    private Boolean classTeacher;
    private Integer classTeacherSemester;
}
