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

    // Public: pass collegeId when calling from the (pre-login) registration page.
    // Omit collegeId when calling from inside the app while logged in - your own college is used.
    @GetMapping
    public List<Department> getDepartments(@RequestParam(required = false) Long collegeId,
                                            @AuthenticationPrincipal String email) {
        return departmentService.getDepartments(collegeId, email);
    }
}
