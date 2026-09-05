package com.campusos.backend.entity;

import java.time.LocalDateTime;

import com.campusos.backend.enums.ComplaintCategory;
import com.campusos.backend.enums.ComplaintStatus;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "class_teacher_id", nullable = false)
    private Teacher classTeacher;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintCategory category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    @ManyToOne
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;
}
