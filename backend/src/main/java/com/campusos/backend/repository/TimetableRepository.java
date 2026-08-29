package com.campusos.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.Teacher;
import com.campusos.backend.entity.Timetable;
import com.campusos.backend.enums.WeekDay;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    // Student Timetable
    List<Timetable> findBySemesterOrderByDayAscLectureNumberAsc(Integer semester);
    List<Timetable> findByDepartmentIdAndSemesterOrderByDayAscLectureNumberAsc(Long departmentId, Integer semester);

    // Teacher Timetable
    List<Timetable> findByTeacherOrderByDayAscLectureNumberAsc(Teacher teacher);

    // Semester Timetable by Day
    List<Timetable> findByDepartmentIdAndSemesterAndDayOrderByLectureNumberAsc(
            Long departmentId,
            Integer semester,
            WeekDay day);

    List<Timetable> findBySemesterAndDayOrderByLectureNumberAsc(
            Integer semester,
            WeekDay day);
    List<Timetable> findBySemesterOrderByDayAscStartTimeAsc(Integer semester);

    // Check duplicate timetable
    boolean existsByDepartmentIdAndSemesterAndDayAndLectureNumber(
            Long departmentId,
            Integer semester,
            WeekDay day,
            Integer lectureNumber);
            
    boolean existsByTeacherIdAndDayAndStartTimeLessThanAndEndTimeGreaterThan(
        Long teacherId,
        WeekDay day,
        java.time.LocalTime endTime,
        java.time.LocalTime startTime
    );

    boolean existsBySubjectIdAndTeacherIdAndDay(Long subjectId, Long teacherId, WeekDay day);

    boolean existsBySubjectIdAndTeacherIdAndDayAndLectureNumber(
            Long subjectId,
            Long teacherId,
            WeekDay day,
            Integer lectureNumber);
}