package com.campusos.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class ExamReminderService {

    private final ExamService examService;

    public ExamReminderService(ExamService examService) {
        this.examService = examService;
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendExamReminders() {
        examService.sendExamReminders();
    }
}