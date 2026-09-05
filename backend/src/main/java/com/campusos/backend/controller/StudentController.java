package com.campusos.backend.controller;

import com.campusos.backend.entity.Student;
import com.campusos.backend.service.StudentService;
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
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/department/{departmentId}")
    public List<Student> getByDepartment(@PathVariable Long departmentId) {
        return studentService.getStudentsByDepartment(departmentId);
    }

    @GetMapping("/department/{departmentId}/semester/{semester}")
    public List<Student> getByDepartmentAndSemester(
            @PathVariable Long departmentId,
            @PathVariable Integer semester) {
        return studentService.getStudentsByDepartmentAndSemester(departmentId, semester);
    }

    @PutMapping("/upgrade-semester")
    public String upgradeSemester(
            @RequestParam Long departmentId,
            @RequestParam Integer fromSemester) {
        int count = studentService.upgradeSemester(departmentId, fromSemester);
        return "Upgraded " + count + " students from Semester " + fromSemester + " to Semester " + (fromSemester + 1);
    }

    @PostMapping("/by-teacher/{teacherId}")
    public Student createStudentByTeacher(
            @PathVariable Long teacherId,
            @RequestBody Student student) {
        return studentService.createStudentByTeacher(teacherId, student);
    }
}