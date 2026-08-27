package com.campusos.backend.service;

import com.campusos.backend.entity.Assignment;
import com.campusos.backend.entity.Notice;
import com.campusos.backend.repository.AssignmentRepository;
import com.campusos.backend.repository.NoticeRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Single-tenant auto-cleanup for Cloudinary attachments.
 * Runs daily at midnight (server timezone, Render uses UTC).
 * Finds Assignment/Notice attachments older than 15 days, deletes them from Cloudinary,
 * and nulls the DB url columns so the record remains but without the file.
 */
@Service
public class FileCleanupService {

    private static final Logger log = LoggerFactory.getLogger(FileCleanupService.class);

    private final AssignmentRepository assignmentRepository;
    private final NoticeRepository noticeRepository;
    private final CloudinaryService cloudinaryService;

    public FileCleanupService(AssignmentRepository assignmentRepository,
                              NoticeRepository noticeRepository,
                              CloudinaryService cloudinaryService) {
        this.assignmentRepository = assignmentRepository;
        this.noticeRepository = noticeRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupOldAttachments() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(15);
        int assignmentsCleaned = 0;
        int noticesCleaned = 0;

        List<Assignment> oldAssignments = assignmentRepository.findByAttachmentUrlIsNotNullAndCreatedAtBefore(cutoff);
        for (Assignment a : oldAssignments) {
            String url = a.getAttachmentUrl();
            try {
                cloudinaryService.deleteByUrl(url);
                a.setAttachmentUrl(null);
                a.setAttachmentFileName(null);
                assignmentRepository.save(a);
                assignmentsCleaned++;
                log.info("Cleaned Assignment {} attachment {}", a.getId(), url);
            } catch (Exception e) {
                log.warn("Failed to cleanup Assignment {} url {}: {}", a.getId(), url, e.getMessage());
            }
        }

        List<Notice> oldNotices = noticeRepository.findByAttachmentUrlIsNotNullAndCreatedAtBefore(cutoff);
        for (Notice n : oldNotices) {
            String url = n.getAttachmentUrl();
            try {
                cloudinaryService.deleteByUrl(url);
                n.setAttachmentUrl(null);
                n.setAttachmentFileName(null);
                noticeRepository.save(n);
                noticesCleaned++;
                log.info("Cleaned Notice {} attachment {}", n.getId(), url);
            } catch (Exception e) {
                log.warn("Failed to cleanup Notice {} url {}: {}", n.getId(), url, e.getMessage());
            }
        }

        if (assignmentsCleaned > 0 || noticesCleaned > 0) {
            log.info("FileCleanupService daily run: cleaned {} assignments, {} notices older than 15 days (cutoff {})", assignmentsCleaned, noticesCleaned, cutoff);
        }
    }
}
