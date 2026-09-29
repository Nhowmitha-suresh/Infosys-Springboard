package com.medisphere.backend.repository;

import com.medisphere.backend.entity.CareTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CareTeamMemberRepository extends JpaRepository<CareTeamMember, Long> {
    List<CareTeamMember> findByPatientIdOrderByIdAsc(Long patientId);
}
