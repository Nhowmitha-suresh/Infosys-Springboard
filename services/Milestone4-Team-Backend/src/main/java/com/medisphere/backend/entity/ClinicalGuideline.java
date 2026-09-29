package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pc_clinical_guidelines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicalGuideline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    /** ADA | ACC | CMS | USP | JC */
    private String code;

    private String icon;

    @Column(name = "guideline_name")
    private String guidelineName;

    private String requirement;

    /** compliant | review | non_compliant */
    private String status;

    private String detail;

    /** display string, e.g. "100%" */
    private String score;

    @Column(name = "updated_label")
    private String updatedLabel;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
