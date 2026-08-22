package com.campusos.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.campusos.backend.dto.AcademicCalendarRequest;
import com.campusos.backend.dto.AcademicCalendarResponse;
import com.campusos.backend.service.AcademicCalendarService;

@RestController
@RequestMapping("/api/academic-calendar")
@CrossOrigin("*")
public class AcademicCalendarController {

    private final AcademicCalendarService academicCalendarService;

    public AcademicCalendarController(
            AcademicCalendarService academicCalendarService) {

        this.academicCalendarService = academicCalendarService;
    }

    // Create Academic Calendar Item
    @PostMapping
    public String createAcademicCalendar(
            @RequestBody AcademicCalendarRequest request,
            @AuthenticationPrincipal String email) {

        return academicCalendarService.createAcademicCalendar(request, email);
    }

    // Get All Calendar Items
    @GetMapping
    public List<AcademicCalendarResponse> getAllAcademicCalendar() {

        return academicCalendarService.getAllAcademicCalendar();
    }

    // Student Calendar
    @GetMapping("/student")
    public List<AcademicCalendarResponse> getStudentCalendar(
            @RequestParam Long departmentId,
            @RequestParam Integer semester) {

        return academicCalendarService.getStudentCalendar(
                departmentId,
                semester);
    }

    @GetMapping("/hod")
    public List<AcademicCalendarResponse> getHodCalendar(@RequestParam Long departmentId) {
        return academicCalendarService.getHodCalendar(departmentId);
    }

    // Teacher Calendar
    @GetMapping("/teacher")
    public List<AcademicCalendarResponse> getTeacherCalendar(
            @RequestParam Long departmentId) {

        return academicCalendarService.getTeacherCalendar(
                departmentId);
    }
}