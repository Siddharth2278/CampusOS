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
public class NoticeRequest {

    private String title;

    private String description;

    // Who should receive it
    private ReceiverRole receiverRole;

    // NORMAL / IMPORTANT / URGENT
    private NoticePriority priority;

    // Optional
    private Long departmentId;

    // Optional
    private Integer semester;

    // Optional: send to exactly one person (a specific teacher or HOD)
    // instead of broadcasting. Only the Principal may set this.
    private Long targetUserId;

    // Logged-in user id
    private Long createdByUserId;

    // Optional expiry
    private LocalDateTime expiryDate;

}