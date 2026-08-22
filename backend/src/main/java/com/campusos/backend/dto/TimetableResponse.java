package com.campusos.backend.dto;

import java.time.LocalTime;

import com.campusos.backend.enums.SessionType;
import com.campusos.backend.enums.WeekDay;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimetableResponse {

    private Long id;

    private String department;

    private Integer semester;

    private WeekDay day;

    private Integer lectureNumber;

    private SessionType sessionType;

    private String subject;

    private String teacher;

    private LocalTime startTime;

    private LocalTime endTime;
}