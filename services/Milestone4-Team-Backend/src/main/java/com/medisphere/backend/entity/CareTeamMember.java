package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pc_care_team_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CareTeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    private String name;

    private String role;

    /** online | away | offline */
    @Column(name = "presence_status")
    private String presenceStatus;

    @Column(name = "last_action")
    private String lastAction;

    @Column(name = "last_action_time")
    private String lastActionTime;

    private String initials;
}
