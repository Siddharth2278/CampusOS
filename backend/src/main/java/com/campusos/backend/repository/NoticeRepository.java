package com.campusos.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.Notice;
import com.campusos.backend.enums.ReceiverRole;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // By Receiver Role
    List<Notice> findByReceiverRoleOrderByCreatedAtDesc(
            ReceiverRole receiverRole);

    // By Semester
    List<Notice> findBySemesterOrderByCreatedAtDesc(
            Integer semester);

    // By Department
    List<Notice> findByDepartmentIdOrderByCreatedAtDesc(
            Long departmentId);

    // Active Notices
    List<Notice> findByExpiryDateAfterOrderByCreatedAtDesc(
            LocalDateTime dateTime);

    List<Notice> findByAttachmentUrlIsNotNullAndCreatedAtBefore(LocalDateTime cutoff);
}