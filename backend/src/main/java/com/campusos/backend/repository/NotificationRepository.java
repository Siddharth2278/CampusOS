package com.campusos.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campusos.backend.entity.Notification;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(
            Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    boolean existsByUserIdAndAssignmentIdAndType(
            Long userId,
            Long assignmentId,
            String type);

    @Modifying
    @Query("""
        UPDATE Notification n
        SET n.isRead = true
        WHERE n.user.id = :userId
        AND n.isRead = false
    """)
    int markAllAsRead(@Param("userId") Long userId);
}