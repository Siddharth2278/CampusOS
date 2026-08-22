package com.campusos.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveStatisticsResponse {

    private long pending;

    private long approved;

    private long rejected;

    private long total;
}