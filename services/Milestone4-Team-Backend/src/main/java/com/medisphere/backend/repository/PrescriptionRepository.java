package com.medisphere.backend.repository;

import com.medisphere.backend.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientIdOrderByDateDesc(Long patientId);
}
