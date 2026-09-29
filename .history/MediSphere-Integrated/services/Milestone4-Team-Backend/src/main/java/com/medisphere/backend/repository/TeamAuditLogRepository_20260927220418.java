package com.medisphere.backend.repository;

import com.medisphere.backend.entity.TeamAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamAuditLogRepository extends JpaRepository<TeamAuditLog, Long> {
    List<TeamAuditLog> findAllByOrderByCreatedAtDesc();
}