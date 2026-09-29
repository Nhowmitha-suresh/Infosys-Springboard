package com.medisphere.backend.repository;

import com.medisphere.backend.entity.Consent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsentRepository extends JpaRepository<Consent, Long> {
    List<Consent> findByPatientId(Long patientId);
}
