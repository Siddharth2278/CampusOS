package com.campusos.backend.entity;

import com.campusos.backend.enums.CollegeType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "colleges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CollegeType type;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Diploma colleges run 6 semesters, Degree colleges run 8. Not stored — derived from type. */
    @Transient
    public Integer getTotalSemesters() {
        return type == CollegeType.DIPLOMA ? 6 : 8;
    }
}
