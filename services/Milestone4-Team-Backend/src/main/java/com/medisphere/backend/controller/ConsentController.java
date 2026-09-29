package com.medisphere.backend.controller;

import com.medisphere.backend.dto.ConsentUpdateRequest;
import com.medisphere.backend.dto.ConsentVerifyRequest;
import com.medisphere.backend.dto.ConsentVerifyResponse;
import com.medisphere.backend.entity.Consent;
import com.medisphere.backend.entity.ConsentAuditLog;
import com.medisphere.backend.service.ConsentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ConsentController {

    private final ConsentService consentService;

    @GetMapping("/api/patients/{id}/consents")
    public List<Consent> getConsents(@PathVariable("id") Long patientId) {
        return consentService.getConsents(patientId);
    }

    @PatchMapping("/api/patients/{id}/consents/{consentId}")
    public Consent updateConsent(@PathVariable("id") Long patientId,
                                  @PathVariable Long consentId,
                                  @RequestBody ConsentUpdateRequest request) {
        return consentService.updateConsent(patientId, consentId, request.isGranted());
    }

    @GetMapping("/api/patients/{id}/consents/audit-log")
    public List<ConsentAuditLog> getAuditLog(@PathVariable("id") Long patientId) {
        return consentService.getAuditLog(patientId);
    }

    @PostMapping("/api/consent/verify")
    public ConsentVerifyResponse verify(@RequestBody ConsentVerifyRequest request) {
        return consentService.verify(request);
    }
}
