package com.campusos.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDashboardResponse {

    private String teacherName;

    private List<TimetableResponse> todaySchedule;

    private Long pendingStudentLeaves;

    private List<AcademicCalendarResponse> academicCalendar;

}