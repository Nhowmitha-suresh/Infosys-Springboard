package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pc_care_plan_goals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarePlanGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "care_plan_id", nullable = false)
    private Long carePlanId;

    @Column(name = "goal_number")
    private Integer goalNumber;

    /** e.g. GLYCEMIC CONTROL */
    private String label;

    private String title;

    private String intervention;

    private String monitoring;

    /** On track | Improving | At risk */
    private String state;
}
