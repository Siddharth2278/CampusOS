package com.campusos.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponseDto {

    private Long id;

    private String examName;

    private String examType;

    private Long subjectId;
    private String subjectName;

    private Long departmentId;
    private String departmentName;

    private Integer semester;

    private LocalDate examDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String room;

    private String academicYear;

    private Long createdByUserId;
    private String createdByName;
}