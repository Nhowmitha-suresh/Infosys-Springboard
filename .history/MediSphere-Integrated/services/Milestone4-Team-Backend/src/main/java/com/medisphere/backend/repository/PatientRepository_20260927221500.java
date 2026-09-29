package com.medisphere.backend.repository;

import com.medisphere.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
	java.util.Optional<Patient> findByEmailIgnoreCase(String email);
}
