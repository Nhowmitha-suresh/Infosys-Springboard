package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Milestone 4 — AI-generated personalized intervention plan.
 * Distinct from the simple {@link CarePlan} (Milestone 1): this one carries
 * the model-driven risk numbers the Precision Care dashboard displays and
 * a clinician review/approval workflow.
 */
@Entity
@Table(name = "pc_care_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrecisionCarePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false, unique = true)
    private Long patientId;

    @Column(name = "diagnosis_summary")
    private String diagnosisSummary;

    @Column(name = "plan_version")
    private String planVersion;

    /** Clinician review ready | Approved | Sent to patient */
    private String status;

    @Column(name = "predicted_cvd_risk")
    private Double predictedCvdRisk;

    @Column(name = "adherence_score")
    private Integer adherenceScore;

    @Column(name = "hospitalization_risk_reduction")
    private Integer hospitalizationRiskReduction;

    @Column(name = "prediction_confidence")
    private Double predictionConfidence;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
