package com.campusos.backend.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Exam name
    @Column(nullable = false)
    private String examName;

    // Example: UNIT_TEST, MIDTERM, END_SEMESTER
    @Column(nullable = false)
    private String examType;

    // Subject for which exam is conducted
    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    // Department
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // Semester
    @Column(nullable = false)
    private Integer semester;

    // Exam date
    @Column(nullable = false)
    private LocalDate examDate;

    // Start time
    @Column(nullable = false)
    private LocalTime startTime;

    // End time
    @Column(nullable = false)
    private LocalTime endTime;

    // Exam room
    @Column(nullable = false)
    private String room;

    // Academic year
    @Column(nullable = false)
    private String academicYear;

    // User who created the exam
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
}