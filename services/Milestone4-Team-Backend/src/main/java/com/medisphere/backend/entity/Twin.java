package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * A patient's Digital Health Twin — one row per patient.
 * Created lazily the first time a patient's twin is viewed/synced.
 */
@Entity
@Table(name = "twins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Twin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false, unique = true)
    private Long patientId;

    /** Synced | Syncing | Error */
    @Column(name = "fhir_sync_status")
    private String fhirSyncStatus;

    @Column(name = "fhir_resource_count")
    private Integer fhirResourceCount;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
