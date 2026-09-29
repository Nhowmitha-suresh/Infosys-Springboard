package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A persisted vitals reading. Columns mirror the target `vitals` table
 * (vital_id, patient_id, heart_rate, spo2, systolic_bp, diastolic_bp,
 * temperature, recorded_at) — patient_id stays a Long here since it
 * references this project's patients.id (bigint), not a text ID.
 *
 * Each live reading pushed over /ws/vitals/{patientId} is also saved
 * here (see VitalsWebSocketHandler) so history survives beyond the
 * WebSocket connection.
 */
@Entity
@Table(name = "vitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vitals {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "heart_rate")
    private Integer heartRate;

    private Integer spo2;

    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    @Column(precision = 4, scale = 1)
    private BigDecimal temperature;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}
