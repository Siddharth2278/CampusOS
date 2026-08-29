package com.campusos.backend.controller;

import com.campusos.backend.entity.Student;
import com.campusos.backend.service.StudentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studentService.createStudent(student);
    }

    @GetMapping
    public List<Student> getAllStudents(@AuthenticationPrincipal String email) {
        return studentService.getStudentsVisibleTo(email);
    }

    @PostMapping("/by-teacher/{teacherId}")
public Student createStudentByTeacher(
        @PathVariable Long teacherId,
        @RequestBody Student student) {

    return studentService.createStudentByTeacher(teacherId, student);
}

    @PutMapping("/{studentId}/promote-semester")
    public Student promoteSemester(@PathVariable Long studentId, @AuthenticationPrincipal String email) {
        return studentService.promoteSemester(studentId, email);
    }

    @PutMapping("/{studentId}")
    public Student updateStudent(@PathVariable Long studentId, @RequestBody Student student, @AuthenticationPrincipal String email) {
        return studentService.updateStudent(studentId, student, email);
    }

    @PutMapping("/promote-semester/bulk")
    public String promoteSemesterBulk(@RequestParam Long departmentId, @RequestParam Integer semester, @AuthenticationPrincipal String email) {
        int count = studentService.promoteSemesterBulk(departmentId, semester, email);
        return count + " student(s) promoted to the next semester.";
    }

    @DeleteMapping("/{studentId}")
    public String deleteStudent(@PathVariable Long studentId, @AuthenticationPrincipal String email) {
        studentService.deleteStudent(studentId, email);
        return "Student removed successfully.";
    }
}