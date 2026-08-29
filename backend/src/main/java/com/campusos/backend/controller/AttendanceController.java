package com.campusos.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.campusos.backend.entity.Attendance;
import com.campusos.backend.service.AttendanceService;
import com.campusos.backend.dto.AttendanceRequest;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Teacher marks attendance
    @PostMapping
    public String saveAttendance(@RequestBody AttendanceRequest request, @AuthenticationPrincipal String email) {
        return attendanceService.saveAttendance(request,email);
    }
    // Student subject-wise attendance history
    @GetMapping("/student/{studentId}/subject/{subjectId}")
    public List<Attendance> getStudentSubjectAttendance(
            @PathVariable Long studentId,
            @PathVariable Long subjectId) {

        return attendanceService.getStudentSubjectAttendance(studentId, subjectId);
    }

    // Student today's attendance
    @GetMapping("/student/{studentId}/today")
    public List<Attendance> getTodayAttendance(
            @PathVariable Long studentId) {

        return attendanceService.getTodayAttendance(studentId);
    }

    // Teacher attendance sheet
    @GetMapping("/subject/{subjectId}")
    public List<Attendance> getAttendanceBySubject(
            @PathVariable Long subjectId,
            @RequestParam LocalDate date) {

        return attendanceService.getAttendanceBySubject(subjectId, date);
    }

    // Complete attendance of one student
    @GetMapping("/student/{studentId}")
    public List<Attendance> getStudentAttendance(
            @PathVariable Long studentId) {

        return attendanceService.getStudentAttendance(studentId);
    }

    // Whether a student is on approved leave for a given date (used to show "On Leave")
    @GetMapping("/student/{studentId}/on-leave")
    public boolean isOnLeave(
            @PathVariable Long studentId,
            @RequestParam LocalDate date) {
        return attendanceService.isOnApprovedLeave(studentId, date);
    }

    // Overall attendance percentage for a student (used by HOD / Class Teacher overviews)
    @GetMapping("/student/{studentId}/percentage")
    public Double getOverallPercentage(@PathVariable Long studentId) {
        return attendanceService.getOverallAttendancePercentage(studentId);
    }
}