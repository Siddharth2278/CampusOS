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
}