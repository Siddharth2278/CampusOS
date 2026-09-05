package com.campusos.backend.repository;

import java.util.List;
import java.util.Optional;

import com.campusos.backend.entity.Student;
import com.campusos.backend.entity.User;
import com.campusos.backend.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository
        extends JpaRepository<Student, Long> {

    List<Student> findByDepartmentIdAndSemester(
            Long departmentId,
            Integer semester);

    List<Student> findByDepartmentId(Long departmentId);
    Optional<Student> findByUser(User user);
    long countByUser_Status(UserStatus status);

    List<Student> findByDepartmentIdAndUser_Status(Long departmentId, UserStatus status);

    List<Student> findByDepartmentIdAndSemesterAndUser_Status(Long departmentId, Integer semester, UserStatus status);

    long countByDepartmentIdAndUser_Status(Long departmentId, UserStatus status);

    long countByDepartmentIdAndSemesterAndUser_Status(Long departmentId, Integer semester, UserStatus status);

}