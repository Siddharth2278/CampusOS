package com.campusos.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Check duplicate attendance
    boolean existsByStudentIdAndSubjectIdAndAttendanceDateAndLectureNumber(
            Long studentId,
            Long subjectId,
            LocalDate attendanceDate,
            Integer lectureNumber
    );

    // Student attendance by subject
    List<Attendance> findByStudentIdAndSubjectIdOrderByAttendanceDateDesc(
            Long studentId,
            Long subjectId
    );

    // Student today's attendance
    List<Attendance> findByStudentIdAndAttendanceDate(
            Long studentId,
            LocalDate attendanceDate
    );

    // Teacher attendance sheet
    List<Attendance> findBySubjectIdAndAttendanceDate(
            Long subjectId,
            LocalDate attendanceDate
    );

    // All attendance of one student
    List<Attendance> findByStudentId(Long studentId);

    // Total attendance records of a student
long countByStudentId(Long studentId);

// Total PRESENT attendance of a student
long countByStudentIdAndStatus(
        Long studentId,
        com.campusos.backend.enums.AttendanceStatus status);

}