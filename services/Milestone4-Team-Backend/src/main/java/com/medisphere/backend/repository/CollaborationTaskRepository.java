package com.medisphere.backend.repository;

import com.medisphere.backend.entity.CollaborationTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollaborationTaskRepository extends JpaRepository<CollaborationTask, Long> {
    List<CollaborationTask> findByPatientIdOrderByCreatedAtAsc(Long patientId);
    long countByPatientIdAndDoneFalse(Long patientId);
}
