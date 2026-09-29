package com.medisphere.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "c_m1_audit_logs", schema = "team_cd")
@Data
@NoArgsConstructor
public class TeamAuditLog {

    @Id
    private Long id;

    @Column(name = "record_key")
    private String recordKey;

    @Column(name = "patient_id")
    private String patientId;

    private String status;

    private Double score;

    private boolean passed;

    @Column(name = "input_json", columnDefinition = "text")
    private String inputJson;

    @Column(name = "result_json", columnDefinition = "text")
    private String resultJson;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}