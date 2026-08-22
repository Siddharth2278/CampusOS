package com.campusos.backend.dto;

import java.time.LocalDateTime;

import com.campusos.backend.enums.NoticePriority;
import com.campusos.backend.enums.ReceiverRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeResponse {

    private Long id;

    private String title;

    private String description;

    private ReceiverRole receiverRole;

    private NoticePriority priority;

    private String department;

    private Integer semester;

    // Set only for a notice sent to one specific person
    private String targetUserName;

    private String attachmentUrl;

    private Long createdByUserId;

    private String createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime expiryDate;
}