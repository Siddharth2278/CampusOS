package com.campusos.backend.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceRequest {

    private Long teacherId;

    private Long subjectId;

    private LocalDate attendanceDate;

    private Integer lectureNumber;

    private List<AttendanceItem> attendanceItems;

}