package com.campusos.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*; import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.campusos.backend.dto.TimetableRequest;
import com.campusos.backend.dto.TimetableResponse;
import com.campusos.backend.service.TimetableService;

@RestController
@RequestMapping("/api/timetable")
@CrossOrigin("*")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    // HOD - Create Timetable
    @PostMapping
    public String createTimetable(@RequestBody TimetableRequest request, @AuthenticationPrincipal String email) {
        return timetableService.createTimetable(request,email);
    }
    // HOD - Update Timetable
    @PutMapping("/{id}")
    public String updateTimetable(
        @PathVariable Long id,
        @RequestBody TimetableRequest request,
        @AuthenticationPrincipal String email) {

    return timetableService.updateTimetable(id, request,email);
    }
    @DeleteMapping("/{id}")
    public String deleteTimetable(@PathVariable Long id, @AuthenticationPrincipal String email) {
    return timetableService.deleteTimetable(id,email);
    }

    // Student - Semester Timetable
    @GetMapping("/semester/{semester}")
    public List<TimetableResponse> getSemesterTimetable(
            @PathVariable Integer semester) {

        return timetableService.getSemesterTimetable(semester);
    }

    // Teacher - Personal Timetable
    @GetMapping("/teacher/{teacherId}")
    public List<TimetableResponse> getTeacherTimetable(
            @PathVariable Long teacherId) {

        return timetableService.getTeacherTimetable(teacherId);
    }
    @GetMapping("/department/{departmentId}/semester/{semester}")
    public List<TimetableResponse> getDepartmentSemester(@PathVariable Long departmentId,@PathVariable Integer semester) {
        return timetableService.getDepartmentSemesterTimetable(departmentId, semester);
    }

    // Weekly Timetable
@GetMapping("/weekly/{semester}")
public List<TimetableResponse> getWeeklyTimetable(
        @PathVariable Integer semester) {

    return timetableService.getWeeklyTimetable(semester);
}
}