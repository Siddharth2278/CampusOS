package com.campusos.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.campusos.backend.dto.LeaveDecisionRequest;
import com.campusos.backend.dto.LeaveRequestDto;
import com.campusos.backend.dto.LeaveResponseDto;
import com.campusos.backend.dto.LeaveStatisticsResponse;
import com.campusos.backend.enums.LeaveStatus;
import com.campusos.backend.enums.LeaveType;
import com.campusos.backend.service.LeaveService;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin("*")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // Apply Leave
    @PostMapping
    public String applyLeave(
            @RequestBody LeaveRequestDto request, @AuthenticationPrincipal String email) {

        return leaveService.applyLeave(request,email);
    }

    // My Leave History
    @GetMapping("/my/{userId}")
    public List<LeaveResponseDto> getMyLeaves(
            @PathVariable Long userId) {

        return leaveService.getMyLeaves(userId);
    }

    // Pending Leaves
    @GetMapping("/pending")
    public List<LeaveResponseDto> getPendingLeaves() {

        return leaveService.getPendingLeaves();
    }
    @PutMapping("/{leaveId}/decision")
    public String leaveDecision(

        @PathVariable Long leaveId,

        @RequestBody LeaveDecisionRequest request, @AuthenticationPrincipal String email) {

        return leaveService.decideLeave(
                leaveId,
                request,email);
}
@GetMapping("/statistics/{userId}")
public LeaveStatisticsResponse getStatistics(
        @PathVariable Long userId) {

    return leaveService.getMyStatistics(userId);
}
@GetMapping("/class-teacher/pending")
public List<LeaveResponseDto> classTeacherPending(@AuthenticationPrincipal String email) {

    return leaveService.getPendingForClassTeacher(email);
}

@GetMapping("/hod/pending")
public List<LeaveResponseDto> hodPending(@AuthenticationPrincipal String email) {

    return leaveService.getPendingForHod(email);
}

@GetMapping("/principal/pending")
public List<LeaveResponseDto> principalPending(@AuthenticationPrincipal String email) {

    return leaveService.getPendingForPrincipal(email);
}
    @GetMapping("/status/{status}")
public List<LeaveResponseDto> getByStatus(
        @PathVariable LeaveStatus status) {

    return leaveService.getLeavesByStatus(status);
}

@GetMapping("/type/{type}")
public List<LeaveResponseDto> getByType(
        @PathVariable LeaveType type) {

    return leaveService.getLeavesByType(type);
}

@GetMapping("/on-leave-student-ids")
public List<Long> getOnLeaveStudentIds(@RequestParam String date) {
    return leaveService.getOnLeaveStudentUserIds(LocalDate.parse(date));
}
}