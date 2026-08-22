package com.campusos.backend.repository;

import java.util.List;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.Assignment;

public interface AssignmentRepository
        extends JpaRepository<Assignment, Long> {

    List<Assignment> findBySubjectIdOrderByDueDateAsc(
            Long subjectId);

    List<Assignment> findByTeacherIdOrderByCreatedAtDesc(
            Long teacherId);

List<Assignment> findByDueDateBetween(
        LocalDateTime start,
        LocalDateTime end);

}