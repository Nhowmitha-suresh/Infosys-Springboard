package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pc_outcome_trend_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeTrendPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    /** cvd_risk today; extensible to other tracked metrics later */
    @Column(name = "metric_key")
    private String metricKey;

    private Integer sequence;

    @Column(name = "day_label")
    private String dayLabel;

    private Double value;
}
