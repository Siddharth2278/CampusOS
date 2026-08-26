package com.campusos.backend.entity;

import java.time.LocalDateTime;

import com.campusos.backend.enums.NoticePriority;
import com.campusos.backend.enums.ReceiverRole;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Notice Title
    @Column(nullable = false)
    private String title;

    // Notice Description
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    // Who should receive the notice
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReceiverRole receiverRole;

    // Notice Priority
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NoticePriority priority;

    // Department (Optional)
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // Semester (Optional)
    private Integer semester;

    // Optional: send to exactly one person instead of broadcasting to a
    // whole role/department/semester group. Only the Principal can set this.
    @ManyToOne
    @JoinColumn(name = "target_user_id")
    private User targetUser;

    // Optional attachment (e.g. a circular, form, or PDF)
    private String attachmentUrl;

    private String attachmentFileName;

    // User who created the notice
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    // Created Date & Time
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Expiry Date & Time
    private LocalDateTime expiryDate;

}