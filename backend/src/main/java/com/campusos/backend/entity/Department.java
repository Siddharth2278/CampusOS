package com.campusos.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "departments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"name", "college_id"}),
        @UniqueConstraint(columnNames = {"code", "college_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    private String description;

    @ManyToOne
    @JoinColumn(name = "college_id")
    @JsonIgnoreProperties({"departments"})
    private College college;

    @OneToOne
    @JoinColumn(name = "hod_teacher_id")
    @JsonIgnoreProperties({"department"})
    private Teacher hod;

}