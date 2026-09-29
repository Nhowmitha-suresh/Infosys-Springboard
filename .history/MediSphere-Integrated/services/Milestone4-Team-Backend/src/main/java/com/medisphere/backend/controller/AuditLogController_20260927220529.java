package com.medisphere.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medisphere.backend.dto.AuditLogResponse;
import com.medisphere.backend.entity.TeamAuditLog;
import com.medisphere.backend.repository.TeamAuditLogRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuditLogController {

    private final TeamAuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/api/audit/logs")
    public List<AuditLogResponse> getAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(TeamAuditLog log) {
        JsonNode result = readResult(log.getResultJson());
        String outcome = result.path("outcome").asText(log.getStatus());
        String action = result.path("action").asText(log.getRecordKey());
        String source = result.path("actor").asText("Team C/D");

        return new AuditLogResponse(
                log.getCreatedAt() == null ? null : log.getCreatedAt().toString(),
                "HIPAA Audit",
                source,
                action,
                "Patient",
                log.getPatientId() == null ? "-" : log.getPatientId(),
                log.isPassed() || "SUCCESS".equalsIgnoreCase(outcome) ? "SUCCESS" : "FAILED",
                "-"
        );
    }

    private JsonNode readResult(String json) {
        try {
            return json == null ? objectMapper.createObjectNode() : objectMapper.readTree(json);
        } catch (Exception ignored) {
            return objectMapper.createObjectNode();
        }
    }
}