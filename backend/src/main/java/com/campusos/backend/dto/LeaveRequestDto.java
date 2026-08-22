package com.campusos.backend.dto;

import java.time.LocalDate;

import com.campusos.backend.enums.LeaveRole;
import com.campusos.backend.enums.LeaveType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {

    private Long userId;

    private LeaveRole leaveRole;

    private LeaveType leaveType;

    private String reason;

    private LocalDate startDate;

    private LocalDate endDate;
}