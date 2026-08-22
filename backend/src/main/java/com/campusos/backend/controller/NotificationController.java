package com.campusos.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.campusos.backend.dto.NotificationResponseDto;
import com.campusos.backend.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    // Create notification
    @PostMapping
    public ResponseEntity<NotificationResponseDto> createNotification(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String type) {

        return ResponseEntity.ok(
                notificationService.createNotification(
                        userId,
                        title,
                        message,
                        type));
    }

    // Get user's notifications
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponseDto>>
            getUserNotifications(
                    @PathVariable Long userId) {

        return ResponseEntity.ok(
                notificationService
                        .getUserNotifications(userId));
    }

    // Mark notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponseDto>
            markAsRead(
                    @PathVariable Long notificationId) {

        return ResponseEntity.ok(
                notificationService
                        .markAsRead(notificationId));
    }
    // Get unread notification count
@GetMapping("/user/{userId}/unread-count")
public ResponseEntity<Long> getUnreadCount(
        @PathVariable Long userId) {

    return ResponseEntity.ok(
            notificationService.getUnreadCount(userId));
}
// Mark all notifications as read
@PutMapping("/user/{userId}/read-all")
public ResponseEntity<Integer> markAllAsRead(
        @PathVariable Long userId) {

    return ResponseEntity.ok(
            notificationService.markAllAsRead(userId));
}
// Delete notification
@DeleteMapping("/{notificationId}")
public ResponseEntity<String> deleteNotification(
        @PathVariable Long notificationId) {

    notificationService.deleteNotification(notificationId);

    return ResponseEntity.ok(
            "Notification deleted successfully.");
}
}