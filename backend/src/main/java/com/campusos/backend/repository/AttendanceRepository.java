package com.campusos.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByStudentIdAndSubjectIdAndAttendanceDateAndLectureNumber(
            Long studentId, Long subjectId, LocalDate attendanceDate, Integer lectureNumber);

    List<Attendance> findByStudentIdAndSubjectIdOrderByAttendanceDateDesc(Long studentId, Long subjectId);

    List<Attendance> findByStudentIdAndAttendanceDate(Long studentId, LocalDate attendanceDate);

    List<Attendance> findBySubjectIdAndAttendanceDate(Long subjectId, LocalDate attendanceDate);

    List<Attendance> findByStudentId(Long studentId);

    long countByStudentId(Long studentId);

    long countByStudentIdAndStatus(Long studentId, com.campusos.backend.enums.AttendanceStatus status);

    List<Attendance> findBySubjectIdAndAttendanceDateBetweenOrderByAttendanceDateAscStudentRollNumberAsc(
            Long subjectId, LocalDate fromDate, LocalDate toDate);
}