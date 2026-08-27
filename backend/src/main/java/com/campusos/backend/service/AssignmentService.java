package com.campusos.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import com.campusos.backend.entity.Student;
import com.campusos.backend.service.NotificationService;
import java.util.UUID;
import com.campusos.backend.entity.AssignmentSubmission;
import com.campusos.backend.enums.AssignmentSubmissionStatus;
import com.campusos.backend.repository.StudentRepository;
import com.campusos.backend.repository.AssignmentSubmissionRepository;


import com.campusos.backend.dto.AssignmentResponseDto;
import com.campusos.backend.entity.Assignment;
import com.campusos.backend.entity.Subject;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.repository.AssignmentRepository;
import com.campusos.backend.repository.SubjectRepository;
import com.campusos.backend.repository.TeacherRepository;
import com.campusos.backend.repository.FacultyAssignmentRepository;
import com.campusos.backend.entity.User;
import com.campusos.backend.repository.UserRepository;


@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;
    private final AssignmentSubmissionRepository submissionRepository;
    private final FacultyAssignmentRepository facultyAssignmentRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

  public AssignmentService(
        AssignmentRepository assignmentRepository,
        SubjectRepository subjectRepository,
        TeacherRepository teacherRepository,
        StudentRepository studentRepository,
        AssignmentSubmissionRepository submissionRepository,
        NotificationService notificationService, FacultyAssignmentRepository facultyAssignmentRepository, UserRepository userRepository,
        CloudinaryService cloudinaryService) {

    this.assignmentRepository = assignmentRepository;
    this.subjectRepository = subjectRepository;
    this.teacherRepository = teacherRepository;
    this.studentRepository = studentRepository;
    this.submissionRepository = submissionRepository;
    this.notificationService = notificationService;
    this.facultyAssignmentRepository = facultyAssignmentRepository;
    this.userRepository = userRepository;
    this.cloudinaryService = cloudinaryService;
}

public AssignmentResponseDto createAssignment(
        String title,
        String description,
        String dueDate,
        Long subjectId,
        Long teacherId,
        MultipartFile attachment,
        String email) {

    Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() ->
                    new RuntimeException("Subject not found"));

    Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() ->
                    new RuntimeException("Teacher not found"));

    User actor=userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));
    Teacher actual=teacherRepository.findByUser(actor).orElseThrow(()->new RuntimeException("Teacher profile not found"));
    if(!actual.getId().equals(teacherId)) throw new RuntimeException("You can only create assignments as yourself");
    if(!facultyAssignmentRepository.existsByTeacherAndSubject(actual, subject)) throw new RuntimeException("This subject is not assigned to you by the HOD");

    if (title == null || title.trim().isEmpty()) {
        throw new RuntimeException("Assignment title is required.");
    }

    if (description == null || description.trim().isEmpty()) {
        throw new RuntimeException(
                "Assignment description is required.");
    }

    if (dueDate == null || dueDate.trim().isEmpty()) {
        throw new RuntimeException("Due date is required.");
    }

    LocalDateTime parsedDueDate;

    try {
        String normalized = dueDate.trim();
        if (normalized.endsWith("Z")) {
            parsedDueDate = java.time.Instant.parse(normalized)
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();
        } else {
            parsedDueDate = LocalDateTime.parse(normalized);
        }
    } catch (Exception e) {
        throw new RuntimeException(
                "Invalid due date format. Use yyyy-MM-ddTHH:mm:ss");
    }

    if (parsedDueDate.isBefore(LocalDateTime.now())) {
        throw new RuntimeException(
                "Due date cannot be in the past.");
    }

    Assignment assignment = new Assignment();

    assignment.setTitle(title);
    assignment.setDescription(description);
    assignment.setDueDate(parsedDueDate);
    assignment.setSubject(subject);
    assignment.setTeacher(teacher);
    assignment.setCreatedAt(LocalDateTime.now());

  if (attachment != null && !attachment.isEmpty()) {

    try {
        String url = cloudinaryService.upload(attachment, "campusos/assignments");
        assignment.setAttachmentUrl(url);
        assignment.setAttachmentFileName(attachment.getOriginalFilename());

    } catch (Exception e) {

        throw new RuntimeException(
                "Failed to save attachment.", e);
    }

} else {

    assignment.setAttachmentUrl(null);
}
Assignment saved =
        assignmentRepository.save(assignment);

// Find students belonging to the same
// department and semester as the assignment subject
Long departmentId =
        subject.getDepartment().getId();

Integer semester =
        subject.getSemester();

List<Student> students =
        studentRepository
                .findByDepartmentIdAndSemester(
                        departmentId,
                        semester);

for (Student student : students) {

    AssignmentSubmission submission =
            new AssignmentSubmission();

    submission.setAssignment(saved);
    submission.setStudent(student);
    submission.setStatus(
            AssignmentSubmissionStatus.NOT_SUBMITTED);
    submission.setSubmittedAt(null);
    submission.setRemarks(null);

    submissionRepository.save(submission);

    // Notify the student about the new assignment
    notificationService.createNotification(
            student.getUser().getId(),
            "New Assignment",
            assignment.getTitle()
                    + " has been assigned.",
            "ASSIGNMENT");
}

return mapToResponse(saved);
}
    // Get assignments created by teacher
    public List<AssignmentResponseDto> getTeacherAssignments(
            Long teacherId) {

        return assignmentRepository
                .findByTeacherIdOrderByCreatedAtDesc(teacherId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Get assignments by subject
    public List<AssignmentResponseDto> getSubjectAssignments(
            Long subjectId) {

        return assignmentRepository
                .findBySubjectIdOrderByDueDateAsc(subjectId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AssignmentResponseDto mapToResponse(
            Assignment assignment) {

        return new AssignmentResponseDto(

                assignment.getId(),

                assignment.getTitle(),

                assignment.getDescription(),

                assignment.getDueDate(),

                assignment.getSubject().getId(),

                assignment.getSubject().getName(),

                assignment.getTeacher().getId(),

                assignment.getTeacher().getFirstName()
                        + " "
                        + assignment.getTeacher().getLastName(),

                assignment.getAttachmentUrl(),

                assignment.getAttachmentFileName(),

                assignment.getCreatedAt());
    }
}