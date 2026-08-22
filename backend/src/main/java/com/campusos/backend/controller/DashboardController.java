package com.campusos.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusos.backend.dto.StudentDashboardResponse;
import com.campusos.backend.dto.TeacherDashboardResponse;
import com.campusos.backend.dto.PrincipalDashboardResponse;
import com.campusos.backend.dto.HodDashboardResponse;
import com.campusos.backend.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // Secure dashboards resolve the profile from the authenticated JWT.
    @GetMapping("/student")
    public StudentDashboardResponse getStudentDashboard(@AuthenticationPrincipal String email) {
        return dashboardService.getStudentDashboardForUser(email);
    }

    @GetMapping("/teacher")
    public TeacherDashboardResponse getTeacherDashboard(@AuthenticationPrincipal String email) {
        return dashboardService.getTeacherDashboardForUser(email);
    }
    @GetMapping("/hod")
    public HodDashboardResponse getHodDashboard(@AuthenticationPrincipal String email) {
        return dashboardService.getHodDashboard(email);
    }

    @GetMapping("/principal")
    public PrincipalDashboardResponse getPrincipalDashboard(@AuthenticationPrincipal String email) {

    return dashboardService.getPrincipalDashboard(email);
}
}