package com.campusos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HodDashboardResponse {
    private String hodName;
    private String departmentName;
    private long totalStudents;
    private long totalTeachers;
    private long pendingLeaves;
    private long classesToday;
    private long activeSubjects;
}
