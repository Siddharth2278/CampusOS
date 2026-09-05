package com.campusos.backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusos.backend.dto.ComplaintDecisionRequest;
import com.campusos.backend.dto.ComplaintRequest;
import com.campusos.backend.dto.ComplaintResponse;
import com.campusos.backend.entity.Complaint;
import com.campusos.backend.entity.Student;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.entity.User;
import com.campusos.backend.enums.ComplaintStatus;
import com.campusos.backend.enums.Role;
import com.campusos.backend.repository.ComplaintRepository;
import com.campusos.backend.repository.StudentRepository;
import com.campusos.backend.repository.TeacherRepository;
import com.campusos.backend.repository.UserRepository;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public ComplaintService(
            ComplaintRepository complaintRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ComplaintResponse raiseComplaint(ComplaintRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        if (!student.getId().equals(request.getStudentId())) {
            throw new RuntimeException("You can only raise complaints for your own account.");
        }

        Teacher classTeacher = teacherRepository
                .findByDepartmentIdAndClassTeacherTrueAndClassTeacherSemester(
                        student.getDepartment().getId(), student.getSemester())
                .orElseThrow(() -> new RuntimeException("No class teacher assigned for your class. Contact HOD."));

        Complaint complaint = new Complaint();
        complaint.setStudent(student);
        complaint.setClassTeacher(classTeacher);
        complaint.setCategory(request.getCategory());
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setStatus(ComplaintStatus.OPEN);
        complaint.setCreatedAt(LocalDateTime.now());
        complaintRepository.save(complaint);

        notificationService.createNotification(
                classTeacher.getUser().getId(),
                "New Complaint",
                student.getFirstName() + " " + student.getLastName() + " raised a complaint: " + request.getTitle(),
                "COMPLAINT");

        return mapToResponse(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getMyComplaints(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));

        return complaintRepository.findByStudentIdOrderByCreatedAtDesc(student.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getTeacherComplaints(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        return complaintRepository.findByClassTeacherIdOrderByCreatedAtDesc(teacher.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getTeacherOpenComplaints(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        return complaintRepository.findByClassTeacherIdAndStatusOrderByCreatedAtDesc(teacher.getId(), ComplaintStatus.OPEN)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getTeacherOpenComplaintCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Teacher teacher = teacherRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

        return complaintRepository.countByClassTeacherIdAndStatus(teacher.getId(), ComplaintStatus.OPEN);
    }

    @Transactional
    public ComplaintResponse decideComplaint(Long complaintId, ComplaintDecisionRequest request, String email) {
        User approver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Teacher approverTeacher = teacherRepository.findByUser(approver).orElse(null);
        if (approverTeacher == null || !approverTeacher.getId().equals(complaint.getClassTeacher().getId())) {
            throw new RuntimeException("You can only resolve complaints assigned to you.");
        }

        if (complaint.getStatus() != ComplaintStatus.OPEN && complaint.getStatus() != ComplaintStatus.IN_PROGRESS) {
            throw new RuntimeException("This complaint has already been resolved.");
        }

        complaint.setStatus(request.getStatus());
        complaint.setResolution(request.getResolution());
        complaint.setResolvedBy(approver);
        complaint.setResolvedAt(LocalDateTime.now());
        complaintRepository.save(complaint);

        notificationService.createNotification(
                complaint.getStudent().getUser().getId(),
                "Complaint " + request.getStatus().name().toLowerCase(),
                "Your complaint \"" + complaint.getTitle() + "\" has been " + request.getStatus().name().toLowerCase() + ".",
                "COMPLAINT");

        return mapToResponse(complaint);
    }

    private ComplaintResponse mapToResponse(Complaint c) {
        return new ComplaintResponse(
                c.getId(),
                c.getStudent().getFirstName() + " " + c.getStudent().getLastName(),
                c.getStudent().getId(),
                c.getClassTeacher().getFirstName() + " " + c.getClassTeacher().getLastName(),
                c.getClassTeacher().getId(),
                c.getCategory(),
                c.getTitle(),
                c.getDescription(),
                c.getStatus(),
                c.getResolution(),
                c.getResolvedBy() != null ? c.getResolvedBy().getFirstName() + " " + c.getResolvedBy().getLastName() : null,
                c.getCreatedAt() != null ? c.getCreatedAt().format(FMT) : null,
                c.getResolvedAt() != null ? c.getResolvedAt().format(FMT) : null);
    }
}
