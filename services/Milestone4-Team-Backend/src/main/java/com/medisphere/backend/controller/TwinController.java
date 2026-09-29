package com.medisphere.backend.controller;

import com.medisphere.backend.entity.Twin;
import com.medisphere.backend.service.TwinService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Digital Health Twin endpoints.
 *   GET  /api/twins                 -> Twin[]        (one per patient, provisioned so far)
 *   GET  /api/twins/summary         -> stat-card counts for the Twin Dashboard
 *   GET  /api/twins/{patientId}     -> Twin           (auto-provisions on first call)
 *   POST /api/twins/{patientId}/sync -> Twin          (re-sync FHIR resource counts)
 */
@RestController
@RequestMapping("/api/twins")
@RequiredArgsConstructor
public class TwinController {

    private final TwinService twinService;

    @GetMapping
    public List<Twin> getAll() {
        return twinService.getAll();
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return twinService.summary();
    }

    @GetMapping("/{patientId}")
    public Twin getByPatientId(@PathVariable Long patientId) {
        return twinService.getByPatientId(patientId);
    }

    @PostMapping("/{patientId}/sync")
    public Twin sync(@PathVariable Long patientId) {
        return twinService.sync(patientId);
    }
}
