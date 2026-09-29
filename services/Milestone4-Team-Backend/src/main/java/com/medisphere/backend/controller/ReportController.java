package com.medisphere.backend.controller;

import com.medisphere.backend.entity.Report;
import com.medisphere.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 *   GET    /api/reports                      -> Report[]
 *   GET    /api/reports/{id}                  -> Report
 *   GET    /api/reports/patient/{patientId}   -> Report[]
 *   POST   /api/reports/generate              -> Report { patientId, type }
 *   DELETE /api/reports/{id}                  -> 204
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public List<Report> getAll() {
        return reportService.getAll();
    }

    @GetMapping("/{id}")
    public Report getById(@PathVariable Long id) {
        return reportService.getById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<Report> getByPatient(@PathVariable Long patientId) {
        return reportService.getByPatient(patientId);
    }

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public Report generate(@RequestBody Map<String, Object> body, Authentication authentication) {
        Long patientId = Long.valueOf(String.valueOf(body.get("patientId")));
        String type = body.get("type") == null ? null : String.valueOf(body.get("type"));
        String generatedBy = authentication != null ? authentication.getName() : "System";
        return reportService.generate(patientId, type, generatedBy);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reportService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
