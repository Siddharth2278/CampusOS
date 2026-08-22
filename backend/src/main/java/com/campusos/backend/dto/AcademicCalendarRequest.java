package com.campusos.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.campusos.backend.enums.CalendarType;
import com.campusos.backend.enums.EventAudience;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcademicCalendarRequest {

    private String title;

    private String description;

    private CalendarType type;

    private EventAudience audience;

    private Long departmentId;

    private Integer semester;

    private String venue;

    private LocalDate eventDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private Long createdByUserId;
}