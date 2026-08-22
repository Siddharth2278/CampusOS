package com.campusos.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDashboardResponse {

    private String studentName;

    private Double overallAttendance;

    private List<TimetableResponse> todayTimetable;

    private List<AcademicCalendarResponse> academicCalendar;

    private LeaveStatisticsResponse leaveStatistics;

    private Integer semester;

    private String departmentName;
}   