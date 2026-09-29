package com.medisphere.backend.repository;

import com.medisphere.backend.entity.OutcomeMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutcomeMetricRepository extends JpaRepository<OutcomeMetric, Long> {
    List<OutcomeMetric> findByPatientIdOrderByDisplayOrderAsc(Long patientId);
    List<OutcomeMetric> findByLabelAndPatientId(String label, Long patientId);
    List<OutcomeMetric> findByLabel(String label);
}
