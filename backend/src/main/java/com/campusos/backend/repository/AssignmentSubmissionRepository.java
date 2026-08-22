package com.campusos.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.AssignmentSubmission;
import com.campusos.backend.enums.AssignmentSubmissionStatus;

public interface AssignmentSubmissionRepository
        extends JpaRepository<AssignmentSubmission, Long> {

    List<AssignmentSubmission> findByAssignmentId(
            Long assignmentId);

    List<AssignmentSubmission> findByStudentId(
            Long studentId);

    List<AssignmentSubmission> findByAssignmentIdAndStatus(
            Long assignmentId,
            AssignmentSubmissionStatus status);
}