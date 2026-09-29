package com.medisphere.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Integer age;

    private String gender;

    private String phone;

    private String email;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "condition")
    private String condition;

    @Column(name = "last_visit")
    private LocalDate lastVisit;

    private String doctor;

    /** Active | Discharged (matches frontend Badge usage) */
    private String status;
}
