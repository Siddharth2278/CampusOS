package com.campusos.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.campusos.backend.dto.ComplaintDecisionRequest;
import com.campusos.backend.dto.ComplaintRequest;
import com.campusos.backend.dto.ComplaintResponse;
import com.campusos.backend.service.ComplaintService;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin("*")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ComplaintResponse raiseComplaint(
            @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal String email) {
        return complaintService.raiseComplaint(request, email);
    }

    @GetMapping("/my")
    public List<ComplaintResponse> getMyComplaints(
            @AuthenticationPrincipal String email) {
        return complaintService.getMyComplaints(email);
    }

    @GetMapping("/teacher/all")
    public List<ComplaintResponse> getTeacherComplaints(
            @AuthenticationPrincipal String email) {
        return complaintService.getTeacherComplaints(email);
    }

    @GetMapping("/teacher/open")
    public List<ComplaintResponse> getTeacherOpenComplaints(
            @AuthenticationPrincipal String email) {
        return complaintService.getTeacherOpenComplaints(email);
    }

    @GetMapping("/teacher/open-count")
    public long getTeacherOpenCount(
            @AuthenticationPrincipal String email) {
        return complaintService.getTeacherOpenComplaintCount(email);
    }

    @PutMapping("/{complaintId}/decision")
    public ComplaintResponse decideComplaint(
            @PathVariable Long complaintId,
            @RequestBody ComplaintDecisionRequest request,
            @AuthenticationPrincipal String email) {
        return complaintService.decideComplaint(complaintId, request, email);
    }
}
