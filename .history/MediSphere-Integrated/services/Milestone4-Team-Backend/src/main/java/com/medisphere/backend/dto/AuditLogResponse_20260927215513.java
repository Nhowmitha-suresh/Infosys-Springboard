package com.medisphere.backend.dto;

import java.time.LocalDateTime;

public record AuditLogResponse(
        LocalDateTime timestamp,
        String module,
        String source,
        String action,
        String resourceType,
        String resourceId,
        String status,
        String ipAddress
) {}