package com.medisphere.backend.repository;

import com.medisphere.backend.entity.CareMilestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CareMilestoneRepository extends JpaRepository<CareMilestone, Long> {
    List<CareMilestone> findByPatientIdOrderByDisplayOrderAsc(Long patientId);
}
