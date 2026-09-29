package com.medisphere.backend.repository;

import com.medisphere.backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Alert> findAllByOrderByCreatedAtDesc();
    List<Alert> findByAcknowledgedFalseOrderByCreatedAtDesc();
    long countByAcknowledgedFalse();

    boolean existsByPatientIdAndSourceAndAcknowledgedFalseAndCreatedAtAfter(
            Long patientId, String source, LocalDateTime after);
}
