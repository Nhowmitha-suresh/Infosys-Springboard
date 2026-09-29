package com.medisphere.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medisphere.backend.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {
	java.util.Optional<Patient> findByEmailIgnoreCase(String email);
}
