package com.campusos.backend.service;

import com.campusos.backend.entity.College;
import com.campusos.backend.entity.Department;
import com.campusos.backend.entity.User;
import com.campusos.backend.repository.CollegeRepository;
import com.campusos.backend.repository.DepartmentRepository;
import com.campusos.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;

    public DepartmentService(DepartmentRepository departmentRepository, UserRepository userRepository,
                              CollegeRepository collegeRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
    }

    public Department createDepartment(Department department, String email) {
        User actor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
        College college = actor.getCollege();
        if (college == null) {
            throw new RuntimeException("Your account is not linked to a college.");
        }

        if (department.getName() == null || department.getCode() == null) {
            throw new RuntimeException("Department name and code are required.");
        }

        if (departmentRepository.existsByNameIgnoreCaseAndCollegeId(department.getName(), college.getId())
                || departmentRepository.existsByCodeIgnoreCaseAndCollegeId(department.getCode(), college.getId())) {
            throw new RuntimeException("Department name or code already exists in your college.");
        }

        department.setCollege(college);
        department.setHod(null);
        return departmentRepository.save(department);
    }

    /**
     * Two ways to call this:
     *  - collegeId provided (registration page, before login): return that college's departments.
     *  - no collegeId, but a logged-in user (in-app usage): return their own college's departments.
     */
    public List<Department> getDepartments(Long collegeId, String email) {
        if (collegeId != null) {
            return departmentRepository.findByCollegeId(collegeId);
        }
        if (email == null || email.isBlank() || "anonymousUser".equals(email)) {
            return List.of();
        }
        User actor = userRepository.findByEmail(email).orElse(null);
        if (actor == null || actor.getCollege() == null) {
            return List.of();
        }
        return departmentRepository.findByCollegeId(actor.getCollege().getId());
    }
}
