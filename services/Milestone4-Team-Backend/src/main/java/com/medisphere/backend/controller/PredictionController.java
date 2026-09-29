package com.medisphere.backend.controller;

import com.medisphere.backend.entity.Prediction;
import com.medisphere.backend.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 *   GET    /api/predictions                    -> Prediction[]  (all, most recent first)
 *   GET    /api/predictions/{id}                -> Prediction
 *   GET    /api/predictions/patient/{patientId} -> Prediction[]
 *   POST   /api/predictions/run                 -> Prediction   { patientId }
 *   DELETE /api/predictions/{id}                -> 204
 */
@RestController
@RequestMapping("/api/predictions")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @GetMapping
    public List<Prediction> getAll() {
        return predictionService.getAll();
    }

    @GetMapping("/{id}")
    public Prediction getById(@PathVariable Long id) {
        return predictionService.getById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<Prediction> getByPatient(@PathVariable Long patientId) {
        return predictionService.getByPatient(patientId);
    }

    @PostMapping("/run")
    public Prediction run(@RequestBody Map<String, Object> body) {
        Long patientId = Long.valueOf(String.valueOf(body.get("patientId")));
        return predictionService.run(patientId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        predictionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
