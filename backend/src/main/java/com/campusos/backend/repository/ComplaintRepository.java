package com.campusos.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusos.backend.entity.Complaint;
import com.campusos.backend.enums.ComplaintStatus;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Complaint> findByClassTeacherIdOrderByCreatedAtDesc(Long classTeacherId);

    List<Complaint> findByClassTeacherIdAndStatusOrderByCreatedAtDesc(Long classTeacherId, ComplaintStatus status);

    long countByClassTeacherIdAndStatus(Long classTeacherId, ComplaintStatus status);

    long countByClassTeacherId(Long classTeacherId);
}
