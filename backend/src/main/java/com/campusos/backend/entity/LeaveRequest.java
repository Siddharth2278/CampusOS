package com.campusos.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.campusos.backend.enums.ApproverRole;
import com.campusos.backend.enums.LeaveRole;
import com.campusos.backend.enums.LeaveStatus;
import com.campusos.backend.enums.LeaveType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "leave_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User applying for leave
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Student / Teacher / HOD
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveRole leaveRole;

    // Sick / Casual / Medical...
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType leaveType;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    // Pending / Approved / Rejected
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status;

    // Who should approve
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApproverRole approverRole;

    // Specific user who should approve this request
    @ManyToOne
    @JoinColumn(name = "assigned_approver_id")
    private User assignedApprover;

    // Approved by
    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private LocalDateTime approvedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}