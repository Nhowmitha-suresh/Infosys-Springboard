package com.medisphere.backend.controller;

import com.medisphere.backend.dto.AuditLogResponse;
import com.medisphere.backend.entity.ConsentAuditLog;
import com.medisphere.backend.repository.ConsentAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AuditLogController {

    private final ConsentAuditLogRepository auditLogRepository;

    @GetMapping("/api/audit/logs")
    public List<AuditLogResponse> getAuditLogs() {
        return auditLogRepository.findAllByOrderByTsDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(ConsentAuditLog log) {
        boolean patientScoped = log.getPatientId() != null;
        String resourceId = patientScoped
                ? String.valueOf(log.getPatientId())
                : log.getConsent();

        return new AuditLogResponse(
                log.getTs(),
                "Consent",
                log.getBy(),
                log.getAction(),
                patientScoped ? "Patient" : "Consent",
                resourceId,
                "SUCCESS",
                "-"
        );
    }
}