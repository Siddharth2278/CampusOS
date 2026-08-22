package com.campusos.backend.repository;

import java.util.List;
import java.util.Optional;

import com.campusos.backend.entity.Teacher;
import com.campusos.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherRepository
        extends JpaRepository<Teacher, Long> {

    List<Teacher> findByDepartmentId(Long departmentId);
    Optional<Teacher> findByUser(User user);
    Optional<Teacher> findByDepartmentIdAndClassTeacherTrueAndClassTeacherSemester(Long departmentId, Integer semester);
    Optional<Teacher> findByDepartmentIdAndHodTrue(Long departmentId);

}