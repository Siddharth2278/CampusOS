package com.campusos.backend.dto;

import java.time.LocalDateTime;

import com.campusos.backend.enums.AssignmentSubmissionStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmissionResponseDto {

    private Long id;

    private Long assignmentId;
    private String assignmentTitle;

    private Long studentId;
    private String studentName;

    private AssignmentSubmissionStatus status;

    private LocalDateTime submittedAt;

    private String remarks;
}