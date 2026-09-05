package com.campusos.backend.dto;

import com.campusos.backend.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDecisionRequest {
    private ComplaintStatus status;
    private String resolution;
}
