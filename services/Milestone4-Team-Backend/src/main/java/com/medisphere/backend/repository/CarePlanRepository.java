package com.medisphere.backend.repository;

import com.medisphere.backend.entity.CarePlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CarePlanRepository extends JpaRepository<CarePlan, Long> {
    List<CarePlan> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<CarePlan> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
