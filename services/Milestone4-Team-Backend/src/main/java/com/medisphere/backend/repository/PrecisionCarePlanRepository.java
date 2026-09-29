package com.medisphere.backend.repository;

import com.medisphere.backend.entity.PrecisionCarePlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PrecisionCarePlanRepository extends JpaRepository<PrecisionCarePlan, Long> {
    Optional<PrecisionCarePlan> findByPatientId(Long patientId);
    long countByPredictedCvdRiskGreaterThanEqual(Double threshold);
}
