package com.campusos.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.campusos.backend.dto.AssignmentSubmissionResponseDto;
import com.campusos.backend.entity.Assignment;
import com.campusos.backend.entity.AssignmentSubmission;
import com.campusos.backend.entity.Student;
import com.campusos.backend.enums.AssignmentSubmissionStatus;
import com.campusos.backend.repository.AssignmentRepository;
import com.campusos.backend.repository.AssignmentSubmissionRepository;
import com.campusos.backend.repository.StudentRepository;

@Service
public class AssignmentSubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;

    public AssignmentSubmissionService(
            AssignmentSubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            StudentRepository studentRepository) {

        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.studentRepository = studentRepository;
    }

    // Create submission record
    public AssignmentSubmissionResponseDto createSubmission(
            Long assignmentId,
            Long studentId) {

        Assignment assignment =
                assignmentRepository.findById(assignmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assignment not found"));

        Student student =
                studentRepository.findById(studentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Student not found"));

        List<AssignmentSubmission> existing =
                submissionRepository.findByAssignmentId(
                        assignmentId);

        for (AssignmentSubmission submission : existing) {

            if (submission.getStudent().getId()
                    .equals(studentId)) {

                throw new RuntimeException(
                        "Submission already exists for this student.");
            }
        }

        AssignmentSubmission submission =
                new AssignmentSubmission();

        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setStatus(
                AssignmentSubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(
                LocalDateTime.now());

        AssignmentSubmission saved =
                submissionRepository.save(submission);

        return mapToResponse(saved);
    }

    // Get submissions for an assignment
    public List<AssignmentSubmissionResponseDto>
            getAssignmentSubmissions(Long assignmentId) {

        return submissionRepository
                .findByAssignmentId(assignmentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get student's submissions
    public List<AssignmentSubmissionResponseDto>
            getStudentSubmissions(Long studentId) {

        return submissionRepository
                .findByStudentId(studentId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Update submission status
    public AssignmentSubmissionResponseDto updateStatus(
            Long submissionId,
            AssignmentSubmissionStatus status,
            String remarks) {

        AssignmentSubmission submission =
                submissionRepository.findById(submissionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Submission not found"));

        submission.setStatus(status);
        submission.setRemarks(remarks);

        if (status == AssignmentSubmissionStatus.SUBMITTED
                && submission.getSubmittedAt() == null) {

            submission.setSubmittedAt(
                    LocalDateTime.now());
        }

        AssignmentSubmission saved =
                submissionRepository.save(submission);

        return mapToResponse(saved);
    }

    // Convert Entity → DTO
    private AssignmentSubmissionResponseDto mapToResponse(
            AssignmentSubmission submission) {

        String studentName =
                submission.getStudent().getFirstName()
                        + " "
                        + submission.getStudent().getLastName();

        return new AssignmentSubmissionResponseDto(
                submission.getId(),

                submission.getAssignment().getId(),
                submission.getAssignment().getTitle(),

                submission.getStudent().getId(),
                studentName,

                submission.getStatus(),
                submission.getSubmittedAt(),
                submission.getRemarks());
    }
}