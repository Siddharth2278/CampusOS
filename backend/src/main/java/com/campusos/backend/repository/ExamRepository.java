package com.campusos.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.Exam;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByDepartmentIdAndSemesterOrderByExamDateAsc(
            Long departmentId,
            Integer semester);

    List<Exam> findBySubjectIdOrderByExamDateAsc(
            Long subjectId);

    List<Exam> findByExamDateOrderByStartTimeAsc(
            LocalDate examDate);
}