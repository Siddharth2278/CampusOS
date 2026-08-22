package com.campusos.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.campusos.backend.dto.NotificationResponseDto;
import com.campusos.backend.entity.Notification;
import com.campusos.backend.entity.User;
import org.springframework.transaction.annotation.Transactional;
import com.campusos.backend.repository.NotificationRepository;
import com.campusos.backend.repository.UserRepository;
import com.campusos.backend.service.NotificationService;
import com.campusos.backend.service.NotificationService;
import com.campusos.backend.entity.Assignment;
import com.campusos.backend.repository.AssignmentRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    
    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            AssignmentRepository assignmentRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
    }

    // Create notification
    public NotificationResponseDto createNotification(
            Long userId,
            String title,
            String message,
            String type) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved =
                notificationRepository.save(notification);

        return mapToResponse(saved);
    }
    public NotificationResponseDto createAssignmentReminderNotification(
        Long userId,
        Long assignmentId,
        String title,
        String message) {

    User user = userRepository.findById(userId)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    Assignment assignment =
            assignmentRepository.findById(assignmentId)
                    .orElseThrow(() ->
                            new RuntimeException("Assignment not found"));

    Notification notification = new Notification();

    notification.setUser(user);
    notification.setAssignment(assignment);
    notification.setTitle(title);
    notification.setMessage(message);
    notification.setType("ASSIGNMENT_REMINDER");
    notification.setIsRead(false);
    notification.setCreatedAt(LocalDateTime.now());

    Notification saved =
            notificationRepository.save(notification);

    return mapToResponse(saved);
}

    // Get user's notifications
    public List<NotificationResponseDto> getUserNotifications(
            Long userId) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Mark notification as read
    public NotificationResponseDto markAsRead(
            Long notificationId) {

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        notification.setIsRead(true);

        Notification saved =
                notificationRepository.save(notification);

        return mapToResponse(saved);
    }

    // Convert Entity → Safe DTO
    private NotificationResponseDto mapToResponse(
            Notification notification) {

        return new NotificationResponseDto(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getUser().getId(),
                notification.getCreatedAt());
    }
    // Get unread notification count
public long getUnreadCount(Long userId) {

    return notificationRepository
            .countByUserIdAndIsReadFalse(userId);
}
// Mark all notifications as read for a user
@Transactional
public int markAllAsRead(Long userId) {

    return notificationRepository
            .markAllAsRead(userId);
}
// Delete notification
public void deleteNotification(Long notificationId) {

    if (!notificationRepository.existsById(notificationId)) {
        throw new RuntimeException("Notification not found");
    }

    notificationRepository.deleteById(notificationId);
}
}