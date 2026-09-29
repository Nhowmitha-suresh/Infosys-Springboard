package com.medisphere.backend.repository;

import com.medisphere.backend.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Prediction> findAllByOrderByCreatedAtDesc();
}
