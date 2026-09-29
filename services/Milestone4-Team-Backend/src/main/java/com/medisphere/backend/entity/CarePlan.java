package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "careplans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "patient_name")
    private String patientName;

    @Column(nullable = false)
    private String title;

    @Column(name = "assigned_doctor")
    private String assignedDoctor;

    @Column(length = 2000)
    private String notes;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    /** Active | Completed | Cancelled */
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
