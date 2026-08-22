package com.campusos.backend.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;

import com.campusos.backend.dto.NoticeResponse;
import com.campusos.backend.service.NoticeService;

import jakarta.annotation.security.PermitAll;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin("*")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    // Create Notice, with an optional attachment
    @PostMapping(consumes = "multipart/form-data")
    public String createNotice(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String receiverRole,
            @RequestParam String priority,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) Long targetUserId,
            @RequestParam(required = false) String expiryDate,
            @RequestParam(required = false) MultipartFile attachment,
            @AuthenticationPrincipal String email) {

        return noticeService.createNotice(
                title, description, receiverRole, priority,
                departmentId, semester, targetUserId, expiryDate,
                attachment, email);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public String updateNotice(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String priority,
            @RequestParam(required = false) String expiryDate,
            @RequestParam(required = false) MultipartFile attachment,
            @AuthenticationPrincipal String email) {

        return noticeService.updateNotice(id, title, description, priority, expiryDate, attachment, email);
    }

    @DeleteMapping("/{id}")
    public String deleteNotice(@PathVariable Long id, @AuthenticationPrincipal String email) {
        return noticeService.deleteNotice(id, email);
    }

    // Get All Notices
    @GetMapping
    public List<NoticeResponse> getAllNotices(@AuthenticationPrincipal String email) {
        return noticeService.getAllNotices(email);
    }

    @PermitAll
    @GetMapping("/attachment/{fileName}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get("uploads/notices").resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
