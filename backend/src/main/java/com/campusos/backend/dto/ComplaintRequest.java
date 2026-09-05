package com.campusos.backend.dto;

import com.campusos.backend.enums.ComplaintCategory;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintRequest {
    private Long studentId;
    private ComplaintCategory category;
    private String title;
    private String description;
}
