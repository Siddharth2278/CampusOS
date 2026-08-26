package com.campusos.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponseDto {

    private Long id;

    private String title;

    private String description;

    private LocalDateTime dueDate;

    private Long subjectId;

    private String subjectName;

    private Long teacherId;

    private String teacherName;

    // Optional
    private String attachmentUrl;

    private String attachmentFileName;

    private LocalDateTime createdAt;
}