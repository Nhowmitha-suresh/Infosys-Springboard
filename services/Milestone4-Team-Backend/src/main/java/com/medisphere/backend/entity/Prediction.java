package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    /** e.g. "12-month cardiac event risk" */
    @Column(name = "risk_type")
    private String riskType;

    @Column(name = "risk_percent")
    private Double riskPercent;

    /** Low | Moderate | High */
    @Column(name = "risk_level")
    private String riskLevel;

    /** Comma-separated list of contributing factors */
    @Column(name = "factors", length = 1000)
    private String factors;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
