package com.campusos.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.campusos.backend.enums.LeaveRole;
import com.campusos.backend.enums.LeaveStatus;
import com.campusos.backend.enums.LeaveType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponseDto {

    private Long id;

    private String userName;

    private LeaveRole leaveRole;

    private LeaveType leaveType;

    private String reason;

    private LocalDate startDate;

    private LocalDate endDate;

    private LeaveStatus status;

    private String approvedBy;

    private LocalDateTime approvedAt;

    private LocalDateTime createdAt;
}