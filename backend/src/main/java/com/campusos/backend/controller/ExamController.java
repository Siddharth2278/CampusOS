package com.campusos.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.campusos.backend.dto.ExamRequest;
import com.campusos.backend.dto.ExamResponseDto;
import com.campusos.backend.service.ExamService;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    // ===========================
    // Create Exam
    // ===========================
    @PostMapping
    public ResponseEntity<ExamResponseDto> createExam(
            @RequestBody ExamRequest request) {

        return ResponseEntity.ok(
                examService.createExam(request));
    }

    // ===========================
    // Get Exams by Department
    // + Semester
    // ===========================
    @GetMapping("/department/{departmentId}/semester/{semester}")
    public ResponseEntity<List<ExamResponseDto>>
            getDepartmentSemesterExams(
                    @PathVariable Long departmentId,
                    @PathVariable Integer semester) {

        return ResponseEntity.ok(
                examService.getDepartmentSemesterExams(
                        departmentId,
                        semester));
    }

    // ===========================
    // Get Exams by Subject
    // ===========================
    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<ExamResponseDto>>
            getSubjectExams(
                    @PathVariable Long subjectId) {

        return ResponseEntity.ok(
                examService.getSubjectExams(subjectId));
    }

    // ===========================
    // Get Exams by Date
    // ===========================
    @GetMapping("/date/{examDate}")
    public ResponseEntity<List<ExamResponseDto>>
            getExamsByDate(
                    @PathVariable LocalDate examDate) {

        return ResponseEntity.ok(
                examService.getExamsByDate(examDate));
    }

    @PutMapping("/{examId}")
public ResponseEntity<ExamResponseDto> updateExam(
        @PathVariable Long examId,
        @RequestBody ExamRequest request) {

    return ResponseEntity.ok(
            examService.updateExam(examId, request));
}

@DeleteMapping("/{examId}")
public ResponseEntity<String> deleteExam(
        @PathVariable Long examId) {

    examService.deleteExam(examId);

    return ResponseEntity.ok(
            "Exam deleted successfully.");
}

@GetMapping("/student/{departmentId}/{semester}")
public ResponseEntity<List<ExamResponseDto>> getStudentExamSchedule(
        @PathVariable Long departmentId,
        @PathVariable Integer semester) {

    return ResponseEntity.ok(
            examService.getDepartmentSemesterExams(
                    departmentId,
                    semester));
}
}