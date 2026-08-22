package com.campusos.backend.repository;

import com.campusos.backend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    long countByDepartmentId(Long departmentId);

}