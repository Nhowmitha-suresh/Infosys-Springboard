package com.medisphere.backend.repository;

import com.medisphere.backend.entity.ConsentAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsentAuditLogRepository extends JpaRepository<ConsentAuditLog, Long> {
    List<ConsentAuditLog> findByPatientIdOrderByTsDesc(Long patientId);
    List<ConsentAuditLog> findAllByOrderByTsDesc();
}
