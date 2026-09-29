package com.medisphere.backend.dto;

public record AuditLogResponse(
        String timestamp,
        String module,
        String source,
        String action,
        String resourceType,
        String resourceId,
        String status,
        String ipAddress
) {}