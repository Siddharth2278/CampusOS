package com.campusos.backend.dto;

import com.campusos.backend.enums.CollegeType;

public record CollegeSummaryDto(Long id, String name, CollegeType type, Integer totalSemesters) {
}
