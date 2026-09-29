package com.medisphere.backend.controller;

import com.medisphere.backend.entity.CarePlan;
import com.medisphere.backend.service.CarePlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 *   GET    /api/careplans                      -> CarePlan[]
 *   GET    /api/careplans/{id}                  -> CarePlan
 *   GET    /api/careplans/patient/{patientId}   -> CarePlan[]
 *   POST   /api/careplans                       -> CarePlan
 *   PUT    /api/careplans/{id}                  -> CarePlan
 *   PATCH  /api/careplans/{id}/status           -> CarePlan { status }
 *   DELETE /api/careplans/{id}                  -> 204
 */
@RestController
@RequestMapping("/api/careplans")
@RequiredArgsConstructor
public class CarePlanController {

    private final CarePlanService carePlanService;

    @GetMapping
    public List<CarePlan> getAll() {
        return carePlanService.getAll();
    }

    @GetMapping("/{id}")
    public CarePlan getById(@PathVariable Long id) {
        return carePlanService.getById(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<CarePlan> getByPatient(@PathVariable Long patientId) {
        return carePlanService.getByPatient(patientId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CarePlan create(@Valid @RequestBody CarePlan carePlan) {
        return carePlanService.create(carePlan);
    }

    @PutMapping("/{id}")
    public CarePlan update(@PathVariable Long id, @RequestBody CarePlan carePlan) {
        return carePlanService.update(id, carePlan);
    }

    @PatchMapping("/{id}/status")
    public CarePlan updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return carePlanService.updateStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        carePlanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
