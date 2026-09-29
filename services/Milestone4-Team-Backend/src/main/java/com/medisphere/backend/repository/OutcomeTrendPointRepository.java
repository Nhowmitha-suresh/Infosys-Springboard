package com.medisphere.backend.repository;

import com.medisphere.backend.entity.OutcomeTrendPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutcomeTrendPointRepository extends JpaRepository<OutcomeTrendPoint, Long> {
    List<OutcomeTrendPoint> findByPatientIdAndMetricKeyOrderBySequenceAsc(Long patientId, String metricKey);
}
