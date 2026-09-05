package com.campusos.backend.dto;

import com.campusos.backend.enums.ComplaintCategory;
import com.campusos.backend.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {
    private Long id;
    private String studentName;
    private Long studentId;
    private String classTeacherName;
    private Long classTeacherId;
    private ComplaintCategory category;
    private String title;
    private String description;
    private ComplaintStatus status;
    private String resolution;
    private String resolvedByName;
    private String createdAt;
    private String resolvedAt;
}
