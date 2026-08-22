package com.campusos.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String teacherId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @ManyToOne
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"hod"})
    private Department department;

    // Is this teacher a Class Teacher?
    @Column(nullable = false)
    private Boolean classTeacher = false;

    // Which semester is this teacher responsible for?
    private Integer classTeacherSemester;

    // Is this teacher the HOD?
    @Column(nullable = false)
    private Boolean hod = false;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}