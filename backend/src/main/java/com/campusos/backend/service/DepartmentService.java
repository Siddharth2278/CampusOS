package com.campusos.backend.service;

import com.campusos.backend.entity.Department;
import com.campusos.backend.entity.User;
import com.campusos.backend.enums.Role;
import com.campusos.backend.repository.DepartmentRepository;
import com.campusos.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public DepartmentService(DepartmentRepository departmentRepository, UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    public Department createDepartment(Department department, String email) {
        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (actor.getRole() != Role.PRINCIPAL) {
            throw new RuntimeException("Only Principal can create departments.");
        }
        if (department.getName() == null || department.getCode() == null) {
            throw new RuntimeException("Department name and code are required.");
        }
        if (departmentRepository.existsByNameIgnoreCase(department.getName())
                || departmentRepository.existsByCodeIgnoreCase(department.getCode())) {
            throw new RuntimeException("Department name or code already exists.");
        }
        department.setHod(null);
        return departmentRepository.save(department);
    }

    public Department updateDepartment(Long id, Department dto, String email) {
        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (actor.getRole() != Role.PRINCIPAL) {
            throw new RuntimeException("Only Principal can edit departments.");
        }
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found."));
        String newName = dto.getName() != null ? dto.getName().trim() : existing.getName();
        String newCode = dto.getCode() != null ? dto.getCode().trim() : existing.getCode();
        String newDesc = dto.getDescription() != null ? dto.getDescription() : existing.getDescription();
        if (newName.isEmpty() || newCode.isEmpty()) throw new RuntimeException("Department name and code are required.");
        if (departmentRepository.existsByNameIgnoreCaseAndIdNot(newName, id)
                || departmentRepository.existsByCodeIgnoreCaseAndIdNot(newCode, id)) {
            throw new RuntimeException("Another department with same name or code already exists.");
        }
        existing.setName(newName);
        existing.setCode(newCode);
        existing.setDescription(newDesc);
        return departmentRepository.save(existing);
    }

    public void deleteDepartment(Long id, String email) {
        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        if (actor.getRole() != Role.PRINCIPAL) {
            throw new RuntimeException("Only Principal can delete departments.");
        }
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found."));
        if (existing.getHod() != null) throw new RuntimeException("Remove HOD assignment before deleting department.");
        departmentRepository.delete(existing);
    }

    public List<Department> getDepartments(Long collegeId, String email) {
        // Single institution: collegeId param ignored, return all departments
        return departmentRepository.findAll();
    }

    public List<Department> getDepartments(String email) {
        return departmentRepository.findAll();
    }
}
