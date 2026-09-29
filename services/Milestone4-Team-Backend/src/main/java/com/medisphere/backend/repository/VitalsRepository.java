package com.medisphere.backend.repository;

import com.medisphere.backend.entity.Vitals;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VitalsRepository extends JpaRepository<Vitals, Long> {
    List<Vitals> findByPatientIdOrderByRecordedAtDesc(Long patientId);

    Optional<Vitals> findFirstByPatientIdOrderByRecordedAtDesc(Long patientId);
}
