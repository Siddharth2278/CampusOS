package com.campusos.backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {

    private Long id;

    private String title;

    private String message;

    private String type;

    private Boolean isRead;

    private Long userId;

    private LocalDateTime createdAt;
}