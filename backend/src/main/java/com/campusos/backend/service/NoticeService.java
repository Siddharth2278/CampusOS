package com.campusos.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Collectors;
import com.campusos.backend.entity.Student;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.repository.StudentRepository;
import com.campusos.backend.repository.TeacherRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.campusos.backend.dto.NoticeRequest;
import com.campusos.backend.dto.NoticeResponse;
import com.campusos.backend.entity.Department;
import com.campusos.backend.entity.Notice;
import com.campusos.backend.entity.User;
import com.campusos.backend.enums.NoticePriority;
import com.campusos.backend.enums.ReceiverRole;
import com.campusos.backend.enums.Role;
import com.campusos.backend.repository.DepartmentRepository;
import com.campusos.backend.repository.NoticeRepository;
import com.campusos.backend.repository.UserRepository;


@Service
public class NoticeService {

  private final NoticeRepository noticeRepository;
private final DepartmentRepository departmentRepository;
private final UserRepository userRepository;
private final StudentRepository studentRepository;
private final TeacherRepository teacherRepository;
private final NotificationService notificationService;
private final FileStorageService fileStorageService;

public NoticeService(
            NoticeRepository noticeRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            StudentRepository studentRepository,
            TeacherRepository teacherRepository,                                
            NotificationService notificationService,
            FileStorageService fileStorageService) {

        this.noticeRepository = noticeRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
    }

    // ===========================
    // Create Notice
    // ===========================
    public String createNotice(
            String title,
            String description,
            String receiverRoleRaw,
            String priorityRaw,
            Long departmentId,
            Integer semester,
            Long targetUserId,
            String expiryDateRaw,
            MultipartFile attachment,
            String email) {

        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Notice title is required.");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new RuntimeException("Notice description is required.");
        }

        ReceiverRole receiverRole;
        NoticePriority priority;
        try {
            receiverRole = ReceiverRole.valueOf(receiverRoleRaw);
        } catch (Exception e) {
            throw new RuntimeException("Invalid audience.");
        }
        try {
            priority = NoticePriority.valueOf(priorityRaw);
        } catch (Exception e) {
            throw new RuntimeException("Invalid priority.");
        }

        LocalDateTime expiryDate = null;
        if (expiryDateRaw != null && !expiryDateRaw.isBlank()) {
            try {
                expiryDate = LocalDateTime.parse(expiryDateRaw);
            } catch (Exception e) {
                throw new RuntimeException("Invalid expiry date format.");
            }
        }

        Notice notice = new Notice();

        notice.setTitle(title);
        notice.setDescription(description);
        notice.setReceiverRole(receiverRole);
        notice.setPriority(priority);
        notice.setSemester(semester);
        notice.setCreatedAt(LocalDateTime.now());
        notice.setExpiryDate(expiryDate);

        if (departmentId != null) {

            Department department = departmentRepository
                    .findById(departmentId)
                    .orElseThrow(() ->
                            new RuntimeException("Department not found"));

            notice.setDepartment(department);
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        switch (user.getRole()) {
            case STUDENT -> throw new RuntimeException("Students cannot publish notices.");
            case TEACHER -> { if (receiverRole != ReceiverRole.STUDENT) throw new RuntimeException("Teachers can send notices only to students"); }
            case HOD -> { if (receiverRole != ReceiverRole.STUDENT && receiverRole != ReceiverRole.TEACHER) throw new RuntimeException("HODs can send notices only to students or teachers"); }
            case PRINCIPAL -> { }
        }

        User targetUser = null;
        if (targetUserId != null) {
            if (user.getRole() != Role.PRINCIPAL) {
                throw new RuntimeException("Only the Principal can send a notice to a specific person.");
            }
            targetUser = userRepository.findById(targetUserId)
                    .orElseThrow(() -> new RuntimeException("Selected recipient not found."));

            if (receiverRole == ReceiverRole.TEACHER && targetUser.getRole() != Role.TEACHER) {
                throw new RuntimeException("Selected recipient is not a Teacher.");
            }
            if (receiverRole == ReceiverRole.HOD && targetUser.getRole() != Role.HOD) {
                throw new RuntimeException("Selected recipient is not a HOD.");
            }
            if (receiverRole == ReceiverRole.STUDENT && targetUser.getRole() != Role.STUDENT) {
                throw new RuntimeException("Selected recipient is not a Student.");
            }

            notice.setTargetUser(targetUser);
        }

        if (attachment != null && !attachment.isEmpty()) {
            try {
                String url = fileStorageService.upload(attachment, "campusos/notices");
                notice.setAttachmentUrl(url);
                notice.setAttachmentFileName(attachment.getOriginalFilename());
            } catch (Exception e) {
                throw new RuntimeException("Failed to save attachment.", e);
            }
        }

        notice.setCreatedBy(user);
Notice saved = noticeRepository.save(notice);

if (targetUser != null) {
    // Personal notice: notify only the selected recipient, skip the
    // broad role/department broadcast below entirely.
    notificationService.createNotification(
            targetUser.getId(), "New Notice", saved.getTitle(), "NOTICE");
    return "Notice sent.";
}

// Send notifications to students
if (saved.getReceiverRole() == ReceiverRole.STUDENT
        || saved.getReceiverRole() == ReceiverRole.ALL) {

    List<com.campusos.backend.entity.Student> students;

    if (saved.getDepartment() != null
            && saved.getSemester() != null) {

        students = studentRepository
                .findByDepartmentIdAndSemester(
                        saved.getDepartment().getId(),
                        saved.getSemester());

    } else if (saved.getDepartment() != null) {

        students = studentRepository
                .findByDepartmentId(
                        saved.getDepartment().getId());

    } else {

        students = studentRepository.findAll();
    }

    for (com.campusos.backend.entity.Student student : students) {

        if (student.getUser() != null) {

            notificationService.createNotification(
                    student.getUser().getId(),
                    "New Notice",
                    saved.getTitle(),
                    "NOTICE");
        }
    }
}
// Send notifications to teachers
if (saved.getReceiverRole() == ReceiverRole.TEACHER
        || saved.getReceiverRole() == ReceiverRole.ALL) {

    List<Teacher> teachers;

    if (saved.getDepartment() != null) {

        teachers = teacherRepository
                .findByDepartmentId(
                        saved.getDepartment().getId());

    } else {

        teachers = teacherRepository.findAll();
    }

    for (Teacher teacher : teachers) {

        if (teacher.getUser() != null) {

            notificationService.createNotification(
                    teacher.getUser().getId(),
                    "New Notice",
                    saved.getTitle(),
                    "NOTICE");
        }
    }
}

// Send notifications to HODs
if (saved.getReceiverRole() == ReceiverRole.HOD || saved.getReceiverRole() == ReceiverRole.ALL) {
    List<Teacher> hods = teacherRepository.findAll().stream().filter(t -> Boolean.TRUE.equals(t.getHod()))
        .filter(t -> saved.getDepartment() == null || (t.getDepartment()!=null && t.getDepartment().getId().equals(saved.getDepartment().getId())))
        .toList();
    for (Teacher hod : hods) if (hod.getUser()!=null) notificationService.createNotification(hod.getUser().getId(),"New Notice",saved.getTitle(),"NOTICE");
}

return "Notice created successfully."; }

    // ===========================
    // Update Notice (creator or Principal only)
    // ===========================
    public String updateNotice(
            Long id,
            String title,
            String description,
            String priorityRaw,
            String expiryDateRaw,
            MultipartFile attachment,
            String email) {

        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found"));

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isOwner = notice.getCreatedBy() != null && notice.getCreatedBy().getId().equals(user.getId());
        if (!isOwner && user.getRole() != Role.PRINCIPAL) {
            throw new RuntimeException("Only the person who posted this notice, or the Principal, can edit it.");
        }

        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Notice title is required.");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new RuntimeException("Notice description is required.");
        }

        NoticePriority priority;
        try {
            priority = NoticePriority.valueOf(priorityRaw);
        } catch (Exception e) {
            throw new RuntimeException("Invalid priority.");
        }

        LocalDateTime expiryDate = null;
        if (expiryDateRaw != null && !expiryDateRaw.isBlank()) {
            try {
                expiryDate = LocalDateTime.parse(expiryDateRaw);
            } catch (Exception e) {
                throw new RuntimeException("Invalid expiry date format.");
            }
        }

        notice.setTitle(title);
        notice.setDescription(description);
        notice.setPriority(priority);
        notice.setExpiryDate(expiryDate);

        if (attachment != null && !attachment.isEmpty()) {
            try {
                String url = fileStorageService.upload(attachment, "campusos/notices");
                notice.setAttachmentUrl(url);
                notice.setAttachmentFileName(attachment.getOriginalFilename());
            } catch (Exception e) {
                throw new RuntimeException("Failed to save attachment.", e);
            }
        }

        noticeRepository.save(notice);
        return "Notice updated.";
    }

    // ===========================
    // Delete Notice (creator or Principal only)
    // ===========================
    public String deleteNotice(Long id, String email) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found"));

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isOwner = notice.getCreatedBy() != null && notice.getCreatedBy().getId().equals(user.getId());
        if (!isOwner && user.getRole() != Role.PRINCIPAL) {
            throw new RuntimeException("Only the person who posted this notice, or the Principal, can delete it.");
        }

        noticeRepository.delete(notice);
        return "Notice deleted.";
    }

    // ===========================
    // Get All Notices
    // ===========================
    public List<NoticeResponse> getAllNotices(String email) {
        User user=userRepository.findByEmail(email).orElseThrow();
        Teacher teacher=(user.getRole()==com.campusos.backend.enums.Role.TEACHER||user.getRole()==com.campusos.backend.enums.Role.HOD)?teacherRepository.findByUser(user).orElse(null):null;
        Student student=user.getRole()==com.campusos.backend.enums.Role.STUDENT?studentRepository.findByUser(user).orElse(null):null;
        return noticeRepository.findAll().stream().filter(n -> {
            if(user.getRole()==com.campusos.backend.enums.Role.PRINCIPAL) return true;
            if(n.getCreatedBy()!=null && n.getCreatedBy().getId().equals(user.getId())) return true;
            if(n.getTargetUser()!=null) return n.getTargetUser().getId().equals(user.getId());
            boolean dep=n.getDepartment()==null || (teacher!=null&&teacher.getDepartment()!=null&&n.getDepartment().getId().equals(teacher.getDepartment().getId())) || (student!=null&&student.getDepartment()!=null&&n.getDepartment().getId().equals(student.getDepartment().getId()));
            if(!dep) return false;
            if(user.getRole()==com.campusos.backend.enums.Role.STUDENT) return n.getReceiverRole()==ReceiverRole.ALL||n.getReceiverRole()==ReceiverRole.STUDENT;
            if(user.getRole()==com.campusos.backend.enums.Role.TEACHER) return n.getReceiverRole()==ReceiverRole.ALL||n.getReceiverRole()==ReceiverRole.TEACHER;
            return n.getReceiverRole()==ReceiverRole.ALL||n.getReceiverRole()==ReceiverRole.TEACHER||n.getReceiverRole()==ReceiverRole.HOD||n.getReceiverRole()==ReceiverRole.STUDENT;
        }).map(this::mapToResponse).collect(Collectors.toList());
    }

    // ===========================
    // Student Notices
    // ===========================
    public List<String> getStudentNotices(
            Long departmentId,
            Integer semester) {

        Set<String> notices = new LinkedHashSet<>();

        noticeRepository
                .findByReceiverRoleOrderByCreatedAtDesc(
                        ReceiverRole.ALL)
                .forEach(n -> notices.add(n.getTitle()));

        noticeRepository
                .findByReceiverRoleOrderByCreatedAtDesc(
                        ReceiverRole.STUDENT)
                .forEach(n -> {

                    if (n.getDepartment() == null ||
                            n.getDepartment().getId().equals(departmentId)) {

                        if (n.getSemester() == null ||
                                n.getSemester().equals(semester)) {

                            notices.add(n.getTitle());
                        }
                    }
                });

        return new ArrayList<>(notices);
    }

    // ===========================
    // Teacher Notices
    // ===========================
    public List<String> getTeacherNotices(
            Long departmentId) {

        Set<String> notices = new LinkedHashSet<>();

        noticeRepository
                .findByReceiverRoleOrderByCreatedAtDesc(
                        ReceiverRole.ALL)
                .forEach(n -> notices.add(n.getTitle()));

        noticeRepository
                .findByReceiverRoleOrderByCreatedAtDesc(
                        ReceiverRole.TEACHER)
                .forEach(n -> {

                    if (n.getDepartment() == null ||
                            n.getDepartment().getId().equals(departmentId)) {

                        notices.add(n.getTitle());
                    }
                });

        return new ArrayList<>(notices);
    }

    // ===========================
    // Convert Entity -> DTO
    // ===========================
    private NoticeResponse mapToResponse(Notice notice) {

        return new NoticeResponse(
                notice.getId(),
                notice.getTitle(),
                notice.getDescription(),
                notice.getReceiverRole(),
                notice.getPriority(),
                notice.getDepartment() != null
                        ? notice.getDepartment().getName()
                        : null,
                notice.getSemester(),
                notice.getTargetUser() != null
                        ? notice.getTargetUser().getFirstName() + " "
                                + notice.getTargetUser().getLastName()
                        : null,
                notice.getAttachmentUrl(),
                notice.getAttachmentFileName(),
                notice.getCreatedBy() != null ? notice.getCreatedBy().getId() : null,
                notice.getCreatedBy() != null
                        ? notice.getCreatedBy().getFirstName() + " "
                                + notice.getCreatedBy().getLastName()
                        : null,
                notice.getCreatedAt(),
                notice.getExpiryDate());
    }
}