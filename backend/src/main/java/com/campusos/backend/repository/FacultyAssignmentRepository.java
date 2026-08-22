package com.campusos.backend.repository;

import com.campusos.backend.entity.FacultyAssignment;
import com.campusos.backend.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import com.campusos.backend.entity.Subject;

public interface FacultyAssignmentRepository extends JpaRepository<FacultyAssignment, Long> {

    List<FacultyAssignment> findByTeacher(Teacher teacher);
    boolean existsByTeacherAndSubject(Teacher teacher, Subject subject);

}