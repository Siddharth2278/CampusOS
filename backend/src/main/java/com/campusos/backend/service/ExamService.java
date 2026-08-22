package com.campusos.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.campusos.backend.dto.ExamRequest;
import com.campusos.backend.dto.ExamResponseDto;
import com.campusos.backend.entity.Department;
import com.campusos.backend.entity.Exam;
import com.campusos.backend.entity.Student;
import com.campusos.backend.entity.Subject;
import com.campusos.backend.entity.User;
import com.campusos.backend.repository.DepartmentRepository;
import com.campusos.backend.repository.ExamRepository;
import com.campusos.backend.repository.StudentRepository;
import com.campusos.backend.repository.SubjectRepository;
import com.campusos.backend.repository.UserRepository;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
private final NotificationService notificationService;

    public ExamService(
            ExamRepository examRepository,
            SubjectRepository subjectRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            StudentRepository studentRepository,
            NotificationService notificationService) {

        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
    }

    // ===========================
    // Create Exam
    // ===========================
    public ExamResponseDto createExam(ExamRequest request) {

        if (request.getExamName() == null ||
                request.getExamName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Exam name is required.");
        }

        if (request.getExamType() == null ||
                request.getExamType().trim().isEmpty()) {

            throw new RuntimeException(
                    "Exam type is required.");
        }

        if (request.getExamDate() == null) {

            throw new RuntimeException(
                    "Exam date is required.");
        }

        if (request.getStartTime() == null ||
                request.getEndTime() == null) {

            throw new RuntimeException(
                    "Exam start time and end time are required.");
        }

        if (!request.getEndTime()
                .isAfter(request.getStartTime())) {

            throw new RuntimeException(
                    "End time must be after start time.");
        }

        if (request.getExamDate()
                .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "Exam date cannot be in the past.");
        }

        Subject subject =
                subjectRepository.findById(
                        request.getSubjectId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Subject not found"));

        Department department =
                departmentRepository.findById(
                        request.getDepartmentId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"));

        User createdBy =
                userRepository.findById(
                        request.getCreatedByUserId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));

        Exam exam = new Exam();

        exam.setExamName(request.getExamName());
        exam.setExamType(request.getExamType());
        exam.setSubject(subject);
        exam.setDepartment(department);
        exam.setSemester(request.getSemester());
        exam.setExamDate(request.getExamDate());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setRoom(request.getRoom());
        exam.setAcademicYear(request.getAcademicYear());
        exam.setCreatedBy(createdBy);

        validateExamConflict(request, null);

        Exam saved = examRepository.save(exam);

        List<Student> students =
        studentRepository.findByDepartmentIdAndSemester(
                department.getId(),
                request.getSemester());

for (Student student : students) {

    notificationService.createNotification(
            student.getUser().getId(),
            "New Exam Scheduled",
            exam.getExamName()
                    + " is scheduled on "
                    + exam.getExamDate()
                    + " at "
                    + exam.getStartTime()
                    + ". Room: "
                    + exam.getRoom(),
            "EXAM");
}

        return mapToResponse(saved);
    }

    // ===========================
    // Get Exams by Department
    // + Semester
    // ===========================
    public List<ExamResponseDto> getDepartmentSemesterExams(
            Long departmentId,
            Integer semester) {

        return examRepository
                .findByDepartmentIdAndSemesterOrderByExamDateAsc(
                        departmentId,
                        semester)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ===========================
    // Get Exams by Subject
    // ===========================
    public List<ExamResponseDto> getSubjectExams(
            Long subjectId) {

        return examRepository
                .findBySubjectIdOrderByExamDateAsc(subjectId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ===========================
    // Get Exams by Date
    // ===========================
    public List<ExamResponseDto> getExamsByDate(
            LocalDate examDate) {

        return examRepository
                .findByExamDateOrderByStartTimeAsc(examDate)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ExamResponseDto updateExam(
        Long examId,
        ExamRequest request) {

    Exam exam = examRepository.findById(examId)
            .orElseThrow(() ->
                    new RuntimeException("Exam not found"));

    Subject subject = subjectRepository.findById(
            request.getSubjectId())
            .orElseThrow(() ->
                    new RuntimeException("Subject not found"));

    Department department = departmentRepository.findById(
            request.getDepartmentId())
            .orElseThrow(() ->
                    new RuntimeException("Department not found"));

    User createdBy = userRepository.findById(
            request.getCreatedByUserId())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (request.getExamName() == null ||
            request.getExamName().trim().isEmpty()) {
        throw new RuntimeException("Exam name is required.");
    }

    if (request.getExamDate() == null) {
        throw new RuntimeException("Exam date is required.");
    }

    if (request.getStartTime() == null ||
            request.getEndTime() == null) {
        throw new RuntimeException(
                "Exam start time and end time are required.");
    }

    if (!request.getEndTime()
            .isAfter(request.getStartTime())) {
        throw new RuntimeException(
                "End time must be after start time.");
    }

    exam.setExamName(request.getExamName());
    exam.setExamType(request.getExamType());
    exam.setSubject(subject);
    exam.setDepartment(department);
    exam.setSemester(request.getSemester());
    exam.setExamDate(request.getExamDate());
    exam.setStartTime(request.getStartTime());
    exam.setEndTime(request.getEndTime());
    exam.setRoom(request.getRoom());
    exam.setAcademicYear(request.getAcademicYear());
    exam.setCreatedBy(createdBy);
    
    validateExamConflict(request, examId);
    Exam updated = examRepository.save(exam);

    return mapToResponse(updated);
}
public void deleteExam(Long examId) {

    Exam exam = examRepository.findById(examId)
            .orElseThrow(() ->
                    new RuntimeException("Exam not found"));

    examRepository.delete(exam);
}

private void validateExamConflict(
        ExamRequest request,
        Long examId) {

    List<Exam> exams =
            examRepository.findByExamDateOrderByStartTimeAsc(
                    request.getExamDate());

    for (Exam existingExam : exams) {

        // Ignore the exam itself while updating
        if (examId != null &&
                existingExam.getId().equals(examId)) {
            continue;
        }

        // Check same room
        if (!existingExam.getRoom()
                .equalsIgnoreCase(request.getRoom())) {
            continue;
        }

        // Check time overlap
        boolean overlap =
                request.getStartTime()
                        .isBefore(existingExam.getEndTime())
                &&
                request.getEndTime()
                        .isAfter(existingExam.getStartTime());

        if (overlap) {
            throw new RuntimeException(
                    "Exam conflict: Room "
                    + request.getRoom()
                    + " is already occupied during this time.");
        }
    }
}

    // ===========================
    // Entity -> DTO
    // ===========================
    private ExamResponseDto mapToResponse(
            Exam exam) {

        return new ExamResponseDto(

                exam.getId(),

                exam.getExamName(),

                exam.getExamType(),

                exam.getSubject().getId(),

                exam.getSubject().getName(),

                exam.getDepartment().getId(),

                exam.getDepartment().getName(),

                exam.getSemester(),

                exam.getExamDate(),

                exam.getStartTime(),

                exam.getEndTime(),

                exam.getRoom(),

                exam.getAcademicYear(),

                exam.getCreatedBy().getId(),

                exam.getCreatedBy().getFirstName()
                        + " "
                        + exam.getCreatedBy().getLastName());
    }

    public void sendExamReminders() {

    LocalDate tomorrow = LocalDate.now().plusDays(1);

    List<Exam> exams =
            examRepository.findByExamDateOrderByStartTimeAsc(
                    tomorrow);

    for (Exam exam : exams) {

        List<Student> students =
                studentRepository
                        .findByDepartmentIdAndSemester(
                                exam.getDepartment().getId(),
                                exam.getSemester());

        for (Student student : students) {

            notificationService.createNotification(
                    student.getUser().getId(),
                    "Exam Reminder",
                    exam.getExamName()
                            + " is scheduled tomorrow at "
                            + exam.getStartTime()
                            + ". Room: "
                            + exam.getRoom(),
                    "EXAM_REMINDER");
        }
    }
}
}