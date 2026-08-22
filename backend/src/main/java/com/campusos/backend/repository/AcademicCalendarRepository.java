package com.campusos.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.AcademicCalendar;
import com.campusos.backend.enums.EventAudience;

public interface AcademicCalendarRepository
        extends JpaRepository<AcademicCalendar, Long> {

    List<AcademicCalendar> findByAudienceOrderByEventDateAsc(
            EventAudience audience);

    List<AcademicCalendar> findByDepartmentIdOrderByEventDateAsc(
            Long departmentId);

    List<AcademicCalendar> findBySemesterOrderByEventDateAsc(
            Integer semester);

    List<AcademicCalendar> findByEventDateGreaterThanEqualOrderByEventDateAsc(
            LocalDate date);
}