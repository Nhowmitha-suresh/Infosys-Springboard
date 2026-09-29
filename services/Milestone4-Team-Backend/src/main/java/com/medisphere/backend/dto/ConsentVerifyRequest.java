package com.medisphere.backend.dto;

import lombok.Data;

@Data
public class ConsentVerifyRequest {
    private String patientId;
    private String patientName;
    private String consentType;
    private boolean consentGiven;
    private String consentDate;  // ISO yyyy-MM-dd, kept as String to mirror the frontend's raw form input
    private String expiryDate;   // nullable
}
