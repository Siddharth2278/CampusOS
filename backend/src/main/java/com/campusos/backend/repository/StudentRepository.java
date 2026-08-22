package com.campusos.backend.repository;

import java.util.List;
import java.util.Optional;

import com.campusos.backend.entity.Student;
import com.campusos.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository
        extends JpaRepository<Student, Long> {

    List<Student> findByDepartmentIdAndSemester(
            Long departmentId,
            Integer semester);

    List<Student> findByDepartmentId(Long departmentId);
    Optional<Student> findByUser(User user);

}