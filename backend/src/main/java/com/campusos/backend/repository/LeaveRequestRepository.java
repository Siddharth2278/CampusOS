package com.campusos.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.LeaveRequest;
import com.campusos.backend.enums.ApproverRole;
import com.campusos.backend.enums.LeaveRole;
import com.campusos.backend.enums.LeaveStatus;
import com.campusos.backend.enums.LeaveType;


public interface LeaveRequestRepository
        extends JpaRepository<LeaveRequest, Long> {

    // My Leave History
    List<LeaveRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Student / Teacher / HOD Leaves
    List<LeaveRequest> findByLeaveRoleOrderByCreatedAtDesc(
            com.campusos.backend.enums.LeaveRole leaveRole);

         List<LeaveRequest> findByUserId(Long userId);

         long countByUserIdAndStatus(Long userId, LeaveStatus status);

        long countByStatus(LeaveStatus status);

        long countByUserId(Long userId);

        List<LeaveRequest> findByLeaveRoleAndStatusOrderByCreatedAtDesc(
        LeaveRole leaveRole,
        LeaveStatus status);

        List<LeaveRequest> findByApproverRoleAndStatusOrderByCreatedAtDesc(
        ApproverRole approverRole,
        LeaveStatus status);

        long countByApproverRoleAndStatus(
        ApproverRole approverRole,
        LeaveStatus status);

        List<LeaveRequest> findByStatusOrderByCreatedAtDesc(
        LeaveStatus status);

List<LeaveRequest> findByLeaveTypeOrderByCreatedAtDesc(
        LeaveType leaveType);

List<LeaveRequest> findByCreatedAtBetween(
        LocalDateTime start,
        LocalDateTime end);

}