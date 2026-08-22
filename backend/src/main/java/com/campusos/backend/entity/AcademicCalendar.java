package com.campusos.backend.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import com.campusos.backend.enums.CalendarType;
import com.campusos.backend.enums.EventAudience;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "academic_calendar")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcademicCalendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Title
    @Column(nullable = false)
    private String title;

    // Description
    @Column(columnDefinition = "TEXT")
    private String description;

    // Holiday / Exam / Workshop / Placement...
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CalendarType type;

    // Who can see it
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventAudience audience;

    // Optional
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // Optional
    private Integer semester;

    // Venue
    private String venue;

    // Date
    @Column(nullable = false)
    private LocalDate eventDate;

    // Time
    private LocalTime startTime;

    private LocalTime endTime;

    // Creator
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Created Date
    private LocalDate createdAt;
}