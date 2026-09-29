package com.medisphere.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medisphere.backend.entity.TeamAuditLog;

public interface TeamAuditLogRepository extends JpaRepository<TeamAuditLog, Long> {
    List<TeamAuditLog> findTop100ByOrderByCreatedAtDesc();
}