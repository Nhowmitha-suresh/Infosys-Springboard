package com.medisphere.backend.repository;

import com.medisphere.backend.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByPatientIdOrderByGeneratedAtDesc(Long patientId);
    List<Report> findAllByOrderByGeneratedAtDesc();
}
