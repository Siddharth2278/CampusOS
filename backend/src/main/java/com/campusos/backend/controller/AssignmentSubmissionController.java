package com.campusos.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.campusos.backend.dto.AssignmentSubmissionResponseDto;
import com.campusos.backend.enums.AssignmentSubmissionStatus;
import com.campusos.backend.service.AssignmentSubmissionService;

@RestController
@RequestMapping("/api/assignment-submissions")
public class AssignmentSubmissionController {

    private final AssignmentSubmissionService submissionService;

    public AssignmentSubmissionController(
            AssignmentSubmissionService submissionService) {

        this.submissionService = submissionService;
    }

    // Mark assignment as submitted
    @PostMapping
    public ResponseEntity<AssignmentSubmissionResponseDto> createSubmission(
            @RequestParam Long assignmentId,
            @RequestParam Long studentId) {

        return ResponseEntity.ok(
                submissionService.createSubmission(
                        assignmentId,
                        studentId));
    }

    // Get all submissions for an assignment
    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<AssignmentSubmissionResponseDto>>
            getAssignmentSubmissions(
                    @PathVariable Long assignmentId) {

        return ResponseEntity.ok(
                submissionService
                        .getAssignmentSubmissions(assignmentId));
    }

    // Get student's submissions
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AssignmentSubmissionResponseDto>>
            getStudentSubmissions(
                    @PathVariable Long studentId) {

        return ResponseEntity.ok(
                submissionService
                        .getStudentSubmissions(studentId));
    }

    // Update submission status
    @PutMapping("/{submissionId}/status")
    public ResponseEntity<AssignmentSubmissionResponseDto> updateStatus(
            @PathVariable Long submissionId,
            @RequestParam AssignmentSubmissionStatus status,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                submissionService.updateStatus(
                        submissionId,
                        status,
                        remarks));
    }
}