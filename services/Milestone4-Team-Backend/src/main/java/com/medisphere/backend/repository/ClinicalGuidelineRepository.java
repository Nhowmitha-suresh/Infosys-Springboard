package com.medisphere.backend.repository;

import com.medisphere.backend.entity.ClinicalGuideline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClinicalGuidelineRepository extends JpaRepository<ClinicalGuideline, Long> {
    List<ClinicalGuideline> findByPatientIdOrderByIdAsc(Long patientId);
    List<ClinicalGuideline> findByPatientIdAndStatusOrderByIdAsc(Long patientId, String status);
}
