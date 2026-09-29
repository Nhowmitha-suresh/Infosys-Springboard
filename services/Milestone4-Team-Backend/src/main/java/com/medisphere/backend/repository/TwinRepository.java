package com.medisphere.backend.repository;

import com.medisphere.backend.entity.Twin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TwinRepository extends JpaRepository<Twin, Long> {
    Optional<Twin> findByPatientId(Long patientId);
}
