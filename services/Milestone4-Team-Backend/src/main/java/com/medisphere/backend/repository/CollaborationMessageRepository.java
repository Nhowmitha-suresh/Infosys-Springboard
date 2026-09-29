package com.medisphere.backend.repository;

import com.medisphere.backend.entity.CollaborationMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollaborationMessageRepository extends JpaRepository<CollaborationMessage, Long> {
    List<CollaborationMessage> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
