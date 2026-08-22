package com.campusos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrincipalDashboardResponse {
    private long totalDepartments;
    private long totalStudents;
    private long totalTeachers;
    private long pendingLeaveApprovals;
    private long totalNotices;
}
