package com.campusos.backend.entity;

import java.time.LocalTime;

import com.campusos.backend.enums.SessionType;
import com.campusos.backend.enums.WeekDay;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "timetable")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Computer, IT, etc.
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // Semester (1-6)
    @Column(nullable = false)
    private Integer semester;

    // Monday - Saturday
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private WeekDay day;

    // Lecture Number
    @Column(nullable = false)
    private Integer lectureNumber;

    // Lecture or Practical
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionType sessionType;

    // Subject
    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    // Teacher
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    // Start Time
    @Column(nullable = false)
    private LocalTime startTime;

    // End Time
    @Column(nullable = false)
    private LocalTime endTime;
}