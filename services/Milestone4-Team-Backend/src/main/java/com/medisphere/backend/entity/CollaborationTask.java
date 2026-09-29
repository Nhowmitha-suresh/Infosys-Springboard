package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "pc_collaboration_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollaborationTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    private String title;

    private String assignee;

    @Column(name = "due_label")
    private String dueLabel;

    private boolean done;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
