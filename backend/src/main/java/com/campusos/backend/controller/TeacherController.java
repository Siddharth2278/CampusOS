package com.campusos.backend.controller;

import com.campusos.backend.entity.Teacher;
import com.campusos.backend.service.TeacherService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {
    private final TeacherService service;

    public TeacherController(TeacherService service) {
        this.service = service;
    }

    @GetMapping
    public List<Teacher> all() {
        return service.getAllTeachers();
    }

    @GetMapping("/hod-candidates")
    public List<Teacher> hodCandidates(@RequestParam Long departmentId) {
        return service.getHodCandidates(departmentId);
    }

    @PutMapping("/{id}/make-hod")
    public Teacher makeHod(@PathVariable Long id, @AuthenticationPrincipal String email) {
        return service.makeHod(id, email);
    }

    @PutMapping("/{id}/class-teacher")
    public Teacher assignClassTeacher(@PathVariable Long id,
                                      @RequestParam Integer semester,
                                      @AuthenticationPrincipal String email) {
        return service.assignClassTeacher(id, semester, email);
    }

    @PutMapping("/{id}")
    public Teacher updateTeacher(@PathVariable Long id, @RequestBody Teacher dto, @AuthenticationPrincipal String email) {
        return service.updateTeacher(id, dto, email);
    }

    @DeleteMapping("/{id}")
    public String deleteTeacher(@PathVariable Long id, @AuthenticationPrincipal String email) {
        service.deleteTeacher(id, email);
        return "Teacher deleted";
    }

    @DeleteMapping("/hod/{departmentId}")
    public Teacher removeHod(@PathVariable Long departmentId, @AuthenticationPrincipal String email) {
        return service.removeHod(departmentId, email);
    }

    @DeleteMapping("/{id}/class-teacher")
    public Teacher removeClassTeacher(@PathVariable Long id, @AuthenticationPrincipal String email) {
        return service.removeClassTeacher(id, email);
    }
}
