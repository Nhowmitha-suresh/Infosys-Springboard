package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pc_care_milestones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CareMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    private String title;

    private String detail;

    /** complete | active | pending */
    private String state;

    @Column(name = "status_label")
    private String statusLabel;

    @Column(name = "display_order")
    private Integer displayOrder;
}
