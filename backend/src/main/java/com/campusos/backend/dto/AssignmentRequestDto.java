package com.campusos.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequestDto {

    private String title;

    private String description;

    private LocalDateTime dueDate;

    private Long subjectId;

    private Long teacherId;

    // Optional
    private String attachmentUrl;
}