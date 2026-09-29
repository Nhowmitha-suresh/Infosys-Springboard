package com.medisphere.backend.controller;

import com.medisphere.backend.entity.Alert;
import com.medisphere.backend.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 *   GET    /api/alerts                      -> Alert[] (all, most recent first)
 *   GET    /api/alerts/unacknowledged        -> Alert[]
 *   GET    /api/alerts/patient/{patientId}   -> Alert[]
 *   POST   /api/alerts                       -> Alert
 *   PATCH  /api/alerts/{id}/acknowledge      -> Alert
 *   DELETE /api/alerts/{id}                  -> 204
 */
@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public List<Alert> getAll() {
        return alertService.getAll();
    }

    @GetMapping("/unacknowledged")
    public List<Alert> getUnacknowledged() {
        return alertService.getUnacknowledged();
    }

    @GetMapping("/patient/{patientId}")
    public List<Alert> getByPatient(@PathVariable Long patientId) {
        return alertService.getByPatient(patientId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Alert create(@Valid @RequestBody Alert alert) {
        return alertService.create(alert);
    }

    @PatchMapping("/{id}/acknowledge")
    public Alert acknowledge(@PathVariable Long id, Authentication authentication) {
        String by = authentication != null ? authentication.getName() : "Unknown";
        return alertService.acknowledge(id, by);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        alertService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
