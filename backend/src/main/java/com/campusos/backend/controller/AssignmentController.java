package com.campusos.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.multipart.MultipartFile;

import com.campusos.backend.dto.AssignmentResponseDto;
import com.campusos.backend.service.AssignmentService;

import jakarta.annotation.security.PermitAll;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(
            AssignmentService assignmentService) {

        this.assignmentService = assignmentService;
    }

    // Create Assignment with optional attachment
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<AssignmentResponseDto> createAssignment(

            @RequestParam String title,

            @RequestParam String description,

            @RequestParam String dueDate,

            @RequestParam Long subjectId,

            @RequestParam Long teacherId,

            @RequestParam(required = false)
            MultipartFile attachment, @AuthenticationPrincipal String email) {

        return ResponseEntity.ok(
                assignmentService.createAssignment(
                        title,
                        description,
                        dueDate,
                        subjectId,
                        teacherId,
                        attachment, email));
    }

    // Teacher's Assignments
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<AssignmentResponseDto>>
            getTeacherAssignments(
                    @PathVariable Long teacherId) {

        return ResponseEntity.ok(
                assignmentService
                        .getTeacherAssignments(teacherId));
    }

    // Subject Assignments
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<AssignmentResponseDto>>
            getSubjectAssignments(
                    @PathVariable Long subjectId) {

        return ResponseEntity.ok(
                assignmentService
                        .getSubjectAssignments(subjectId));
    }
    @PermitAll
    @GetMapping("/attachment/{fileName}")
    public ResponseEntity<Resource> downloadAttachment(
        @PathVariable String fileName) {

    try {

        Path filePath = Paths.get("uploads/assignments")
                .resolve(fileName)
                .normalize();

        Resource resource = new UrlResource(
                filePath.toUri());

        if (!resource.exists() ||
                !resource.isReadable()) {

            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                resource.getFilename() + "\"")
                .body(resource);

    } catch (Exception e) {

        return ResponseEntity.notFound().build();
    }
}
}