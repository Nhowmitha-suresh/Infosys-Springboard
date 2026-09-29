package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pc_outcome_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    /** HbA1c | Blood Pressure | CVD Risk | Adherence | ... */
    private String label;

    @Column(name = "current_value")
    private String currentValue;

    @Column(name = "target_value")
    private String targetValue;

    @Column(name = "baseline_value")
    private String baselineValue;

    @Column(name = "change_text")
    private String changeText;

    @Column(name = "progress_percent")
    private Integer progressPercent;

    /** Improving | Trending down | Above target */
    private String status;

    private String icon;

    /** blue | purple | green | cyan */
    private String tone;

    @Column(name = "display_order")
    private Integer displayOrder;
}
