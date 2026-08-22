package com.campusos.backend.dto;

import com.campusos.backend.enums.LeaveStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveDecisionRequest {

    private Long approvedByUserId;

    private LeaveStatus status;

    private String remarks;

}