package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "consent_audit_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsentAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nullable: patient-scoped toggles set this; free-form /consent/verify calls may not. */
    @Column(name = "patient_id")
    private Long patientId;

    /** Granted | Revoked */
    private String action;

    private String consent;

    /** Name of whoever performed the action */
    @Column(name = "performed_by")
    private String by;

    private LocalDateTime ts;
}
