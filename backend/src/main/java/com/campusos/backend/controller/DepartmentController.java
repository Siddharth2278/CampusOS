package com.campusos.backend.controller;

import com.campusos.backend.entity.Department;
import com.campusos.backend.service.DepartmentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping
    public Department createDepartment(@RequestBody Department department, @AuthenticationPrincipal String email) {
        return departmentService.createDepartment(department, email);
    }

    @PutMapping("/{id}")
    public Department updateDepartment(@PathVariable Long id, @RequestBody Department department, @AuthenticationPrincipal String email) {
        return departmentService.updateDepartment(id, department, email);
    }

    @DeleteMapping("/{id}")
    public String deleteDepartment(@PathVariable Long id, @AuthenticationPrincipal String email) {
        departmentService.deleteDepartment(id, email);
        return "Department deleted";
    }

    @GetMapping
    public List<Department> getDepartments(@RequestParam(required = false) Long collegeId,
                                            @AuthenticationPrincipal String email) {
        // collegeId ignored after single-institution refactor — kept for backward compat with frontend
        return departmentService.getDepartments(email);
    }
}
