package com.medisphere.backend.service;

import com.medisphere.backend.dto.ConsentVerifyRequest;
import com.medisphere.backend.dto.ConsentVerifyResponse;
import com.medisphere.backend.entity.Consent;
import com.medisphere.backend.entity.ConsentAuditLog;
import com.medisphere.backend.entity.Patient;
import com.medisphere.backend.exception.ResourceNotFoundException;
import com.medisphere.backend.repository.ConsentAuditLogRepository;
import com.medisphere.backend.repository.ConsentRepository;
import com.medisphere.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConsentService {

    private static final Map<String, String> CONSENT_TYPE_LABELS = Map.of(
            "TREATMENT", "Treatment",
            "DATA_SHARING", "Data Sharing (Insurance/Third-party)",
            "RESEARCH", "Research (Anonymized)",
            "TELEMEDICINE_RECORDING", "Telemedicine Recording",
            "REMINDERS", "SMS/Email Reminders"
    );

    private final ConsentRepository consentRepository;
    private final ConsentAuditLogRepository auditLogRepository;
    private final PatientRepository patientRepository;

    public List<Consent> getConsents(Long patientId) {
        ensurePatientExists(patientId);
        return consentRepository.findByPatientId(patientId);
    }

    public Consent updateConsent(Long patientId, Long consentId, boolean granted) {
        ensurePatientExists(patientId);
        Consent consent = consentRepository.findById(consentId)
                .orElseThrow(() -> new ResourceNotFoundException("Consent " + consentId + " not found"));
        if (!consent.getPatientId().equals(patientId)) {
            throw new ResourceNotFoundException("Consent " + consentId + " does not belong to patient " + patientId);
        }

        consent.setGranted(granted);
        Consent saved = consentRepository.save(consent);

        ConsentAuditLog log = new ConsentAuditLog();
        log.setPatientId(patientId);
        log.setAction(granted ? "Granted" : "Revoked");
        log.setConsent(consent.getLabel());
        log.setBy(patientRepository.findById(patientId).map(Patient::getName).orElse("Unknown"));
        log.setTs(LocalDateTime.now());
        auditLogRepository.save(log);

        return saved;
    }

    public List<ConsentAuditLog> getAuditLog(Long patientId) {
        ensurePatientExists(patientId);
        return auditLogRepository.findByPatientIdOrderByTsDesc(patientId);
    }

    /**
     * Mirrors POST /api/consent/verify from consentService.js — a standalone
     * staff-facing verification endpoint, not tied to a specific Patient row
     * (patientId here is a free-form string like "P101").
     */
    public ConsentVerifyResponse verify(ConsentVerifyRequest req) {
        List<String> errors = new ArrayList<>();
        if (isBlank(req.getPatientId())) errors.add("patientId is required");
        if (isBlank(req.getPatientName())) errors.add("patientName is required");
        if (isBlank(req.getConsentType())) errors.add("consentType is required");
        if (isBlank(req.getConsentDate())) errors.add("consentDate is required");
        if (req.isConsentGiven() && !isBlank(req.getExpiryDate()) && !isBlank(req.getConsentDate())
                && req.getExpiryDate().compareTo(req.getConsentDate()) < 0) {
            errors.add("expiryDate cannot be before consentDate");
        }

        if (!errors.isEmpty()) {
            return new ConsentVerifyResponse("ERROR", "Consent verification failed", errors);
        }

        String typeLabel = CONSENT_TYPE_LABELS.getOrDefault(req.getConsentType(), req.getConsentType());

        ConsentAuditLog log = new ConsentAuditLog();
        log.setAction(req.isConsentGiven() ? "Granted" : "Revoked");
        log.setConsent(typeLabel + " (" + req.getPatientId() + ")");
        log.setBy(req.getPatientName());
        log.setTs(LocalDateTime.now());
        auditLogRepository.save(log);

        return new ConsentVerifyResponse("SUCCESS", "Patient consent verified successfully", List.of());
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private void ensurePatientExists(Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient " + patientId + " not found");
        }
    }
}
