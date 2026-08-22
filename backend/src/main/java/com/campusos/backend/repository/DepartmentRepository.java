package com.campusos.backend.repository;

import com.campusos.backend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByCollegeId(Long collegeId);
    boolean existsByNameIgnoreCaseAndCollegeId(String name, Long collegeId);
    boolean existsByCodeIgnoreCaseAndCollegeId(String code, Long collegeId);

}