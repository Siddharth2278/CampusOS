package com.campusos.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.campusos.backend.dto.LeaveDecisionRequest;
import com.campusos.backend.dto.LeaveRequestDto;
import com.campusos.backend.dto.LeaveResponseDto;
import com.campusos.backend.dto.LeaveStatisticsResponse;
import com.campusos.backend.entity.LeaveRequest;
import com.campusos.backend.entity.User;
import com.campusos.backend.entity.Teacher;
import com.campusos.backend.entity.Student;
import com.campusos.backend.enums.ApproverRole;
import com.campusos.backend.enums.LeaveRole;
import com.campusos.backend.enums.LeaveStatus;
import com.campusos.backend.enums.LeaveType;
import com.campusos.backend.repository.LeaveRequestRepository;
import com.campusos.backend.repository.UserRepository;
import com.campusos.backend.repository.TeacherRepository;
import com.campusos.backend.repository.StudentRepository;
import com.campusos.backend.enums.Role;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public LeaveService(
            LeaveRequestRepository leaveRequestRepository,
            UserRepository userRepository, TeacherRepository teacherRepository, StudentRepository studentRepository) {

        this.leaveRequestRepository = leaveRequestRepository;
        this.userRepository = userRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }

    // Apply Leave
public String applyLeave(LeaveRequestDto request, String email) {

    User current=userRepository.findByEmail(email).orElseThrow();
    if(!current.getId().equals(request.getUserId())) throw new RuntimeException("You can apply leave only for your own account");

    // Reason validation
    if (request.getReason() == null ||
            request.getReason().trim().isEmpty()) {

        throw new RuntimeException("Leave reason is required.");
    }

    // Date validation
    if (request.getEndDate().isBefore(request.getStartDate())) {

        throw new RuntimeException(
                "End date cannot be before start date.");
    }

    // Past date validation
    if (request.getStartDate().isBefore(LocalDate.now())) {

        throw new RuntimeException(
                "Leave cannot start in the past.");
    }

    // Overlapping leave validation
    List<LeaveRequest> existingLeaves =
            leaveRequestRepository.findByUserId(request.getUserId());

    for (LeaveRequest existing : existingLeaves) {

        boolean overlap =
                !request.getEndDate().isBefore(existing.getStartDate())
                        &&
                        !request.getStartDate().isAfter(existing.getEndDate());

        if (overlap &&
                existing.getStatus() != LeaveStatus.REJECTED) {

            throw new RuntimeException(
                    "Leave request overlaps with an existing leave.");
        }
    }

    User user = userRepository.findById(request.getUserId())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    LeaveRequest leave = new LeaveRequest();

    leave.setUser(user);
    leave.setLeaveRole(request.getLeaveRole());
    leave.setLeaveType(request.getLeaveType());
    leave.setReason(request.getReason());
    leave.setStartDate(request.getStartDate());
    leave.setEndDate(request.getEndDate());

    leave.setStatus(LeaveStatus.PENDING);

    switch (request.getLeaveRole()) {

        case STUDENT ->
            leave.setApproverRole(ApproverRole.CLASS_TEACHER);

        case TEACHER ->
            leave.setApproverRole(ApproverRole.HOD);

        case HOD ->
            leave.setApproverRole(ApproverRole.PRINCIPAL);
    }

    leave.setCreatedAt(LocalDateTime.now());

    leaveRequestRepository.save(leave);

    return "Leave request submitted successfully.";
}

    // My Leave History
    public List<LeaveResponseDto> getMyLeaves(Long userId) {

        return leaveRequestRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Pending Leaves
    public List<LeaveResponseDto> getPendingLeaves() {

        return leaveRequestRepository
                .findByStatusOrderByCreatedAtDesc(
                        LeaveStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private LeaveResponseDto mapToResponse(
            LeaveRequest leave) {

        return new LeaveResponseDto(

                leave.getId(),

                leave.getUser().getFirstName()
                        + " "
                        + leave.getUser().getLastName(),

                leave.getLeaveRole(),

                leave.getLeaveType(),

                leave.getReason(),

                leave.getStartDate(),

                leave.getEndDate(),

                leave.getStatus(),

                leave.getApprovedBy() != null
                        ? leave.getApprovedBy().getFirstName()
                                + " "
                                + leave.getApprovedBy().getLastName()
                        : null,

                leave.getApprovedAt(),

                leave.getCreatedAt());
    }
    public String decideLeave(
        Long leaveId,
        LeaveDecisionRequest request, String email) {

    LeaveRequest leave = leaveRequestRepository.findById(leaveId)
            .orElseThrow(() ->
                    new RuntimeException("Leave request not found"));

    // Already processed
    if (leave.getStatus() != LeaveStatus.PENDING) {

        throw new RuntimeException(
                "This leave request has already been processed.");
    }

    User approver = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Approver not found"));
    if(!approver.getId().equals(request.getApprovedByUserId())) throw new RuntimeException("You can approve leave only as yourself");
    Teacher approverTeacher=(approver.getRole()==Role.TEACHER||approver.getRole()==Role.HOD)?teacherRepository.findByUser(approver).orElse(null):null;
    if(leave.getApproverRole()==ApproverRole.CLASS_TEACHER) {
        if(approverTeacher==null || !Boolean.TRUE.equals(approverTeacher.getClassTeacher())) throw new RuntimeException("Only the assigned Class Teacher can approve this leave");
        Student applicant=studentRepository.findByUser(leave.getUser()).orElseThrow();
        if(applicant.getDepartment()==null || approverTeacher.getDepartment()==null || !applicant.getDepartment().getId().equals(approverTeacher.getDepartment().getId()) || !applicant.getSemester().equals(approverTeacher.getClassTeacherSemester())) throw new RuntimeException("This leave is not for your assigned class");
    } else if(leave.getApproverRole()==ApproverRole.HOD) {
        if(approverTeacher==null || !Boolean.TRUE.equals(approverTeacher.getHod())) throw new RuntimeException("Only the HOD can approve this leave");
        Teacher applicant=teacherRepository.findByUser(leave.getUser()).orElseThrow();
        if(applicant.getDepartment()==null || approverTeacher.getDepartment()==null || !applicant.getDepartment().getId().equals(approverTeacher.getDepartment().getId())) throw new RuntimeException("This leave is outside your department");
    } else if(leave.getApproverRole()==ApproverRole.PRINCIPAL && approver.getRole()!=Role.PRINCIPAL) throw new RuntimeException("Only the Principal can approve this leave");

    if (request.getStatus() == LeaveStatus.PENDING) {

        throw new RuntimeException(
                "Invalid leave status.");
    }

    leave.setStatus(request.getStatus());
    leave.setApprovedBy(approver);
    leave.setApprovedAt(LocalDateTime.now());
    leave.setRemarks(request.getRemarks());

    leaveRequestRepository.save(leave);

    return "Leave updated successfully.";
}
public LeaveStatisticsResponse getMyStatistics(Long userId) {

    long pending = leaveRequestRepository.countByUserIdAndStatus(
            userId,
            LeaveStatus.PENDING);

    long approved = leaveRequestRepository.countByUserIdAndStatus(
            userId,
            LeaveStatus.APPROVED);

    long rejected = leaveRequestRepository.countByUserIdAndStatus(
            userId,
            LeaveStatus.REJECTED);

    long total = leaveRequestRepository.countByUserId(userId);

    return new LeaveStatisticsResponse(
            pending,
            approved,
            rejected,
            total);
}
public List<LeaveResponseDto> getPendingForClassTeacher(String email) {

    User current = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    Teacher classTeacher = teacherRepository.findByUser(current)
            .orElseThrow(() -> new RuntimeException("Teacher profile not found"));

    if (!Boolean.TRUE.equals(classTeacher.getClassTeacher())
            || classTeacher.getDepartment() == null
            || classTeacher.getClassTeacherSemester() == null) {
        // Not currently assigned as a class teacher of any class -> nothing to show
        return List.of();
    }

    return leaveRequestRepository
            .findByApproverRoleAndStatusOrderByCreatedAtDesc(
                    ApproverRole.CLASS_TEACHER,
                    LeaveStatus.PENDING)
            .stream()
            .filter(leave -> {
                Student applicant = studentRepository.findByUser(leave.getUser()).orElse(null);
                return applicant != null
                        && applicant.getDepartment() != null
                        && applicant.getDepartment().getId().equals(classTeacher.getDepartment().getId())
                        && applicant.getSemester() != null
                        && applicant.getSemester().equals(classTeacher.getClassTeacherSemester());
            })
            .map(this::mapToResponse)
            .collect(Collectors.toList());
}

public List<LeaveResponseDto> getPendingForHod(String email) {

    return leaveRequestRepository
            .findByApproverRoleAndStatusOrderByCreatedAtDesc(
                    ApproverRole.HOD,
                    LeaveStatus.PENDING)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
}

public List<LeaveResponseDto> getPendingForPrincipal(String email) {

    return leaveRequestRepository
            .findByApproverRoleAndStatusOrderByCreatedAtDesc(
                    ApproverRole.PRINCIPAL,
                    LeaveStatus.PENDING)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
}
public Long getPendingStudentLeavesCount() {

    return leaveRequestRepository
            .countByApproverRoleAndStatus(
                    ApproverRole.CLASS_TEACHER,
                    LeaveStatus.PENDING);
}
    public List<LeaveResponseDto> getLeavesByStatus(
        LeaveStatus status) {

    return leaveRequestRepository
            .findByStatusOrderByCreatedAtDesc(status)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
}

public List<LeaveResponseDto> getLeavesByType(
        LeaveType type) {

    return leaveRequestRepository
            .findByLeaveTypeOrderByCreatedAtDesc(type)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
}

}