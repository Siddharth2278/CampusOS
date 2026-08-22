package com.campusos.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.campusos.backend.entity.Assignment;
import com.campusos.backend.entity.AssignmentSubmission;
import com.campusos.backend.entity.Student;
import com.campusos.backend.enums.AssignmentSubmissionStatus;
import com.campusos.backend.repository.AssignmentRepository;
import com.campusos.backend.repository.AssignmentSubmissionRepository;
import com.campusos.backend.repository.NotificationRepository;

@Service
public class AssignmentReminderService {

    private final AssignmentRepository assignmentRepository;
    private final NotificationService notificationService;
    private final AssignmentSubmissionRepository submissionRepository;
    private final NotificationRepository notificationRepository;

    public AssignmentReminderService(
            AssignmentRepository assignmentRepository,
            NotificationService notificationService,
            AssignmentSubmissionRepository submissionRepository,
            NotificationRepository notificationRepository) {

        this.assignmentRepository = assignmentRepository;
        this.notificationService = notificationService;
        this.submissionRepository = submissionRepository;
        this.notificationRepository = notificationRepository;
    }

    @Scheduled(fixedRate = 3600000)
    public void sendAssignmentReminders() {
    
        LocalDateTime now = LocalDateTime.now();

        LocalDateTime reminderStart = now.plusHours(23);
        LocalDateTime reminderEnd = now.plusHours(25);

        List<Assignment> assignments =
                assignmentRepository.findByDueDateBetween(
                        reminderStart,
                        reminderEnd);
                        System.out.println(
        "REMINDER CHECK: found "
        + assignments.size()
        + " assignments");

        for (Assignment assignment : assignments) {

            List<AssignmentSubmission> submissions =
                    submissionRepository
                            .findByAssignmentIdAndStatus(
                                    assignment.getId(),
                                    AssignmentSubmissionStatus.NOT_SUBMITTED);

            for (AssignmentSubmission submission : submissions) {

                Student student = submission.getStudent();

                String message =
                        assignment.getTitle()
                                + " is due tomorrow.";

                boolean alreadySent =
        notificationRepository
                .existsByUserIdAndAssignmentIdAndType(
                        student.getUser().getId(),
                        assignment.getId(),
                        "ASSIGNMENT_REMINDER");

                if (!alreadySent) {
                    notificationService.createAssignmentReminderNotification(
        student.getUser().getId(),
        assignment.getId(),
        "Assignment Reminder",
        message);
                }
            }
        }
    }
}