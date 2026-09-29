package com.medisphere.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.medisphere.backend.entity.Appointment;
import com.medisphere.backend.entity.Patient;
import com.medisphere.backend.entity.Prescription;
import com.medisphere.backend.entity.User;
import com.medisphere.backend.entity.Vitals;
import com.medisphere.backend.service.PatientService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public List<Patient> getAll(@AuthenticationPrincipal User user) {
        if (isPatient(user)) {
            return patientService.getByEmail(user.getEmail()).map(List::of).orElseGet(List::of);
        }
        return patientService.getAll();
    }

    @GetMapping("/me")
    public Patient getMyRecord(@AuthenticationPrincipal User user) {
        return patientService.getByEmail(user.getEmail())
                .orElseThrow(() -> new com.medisphere.backend.exception.ResourceNotFoundException("Patient record not found"));
    }

    @GetMapping("/{id}")
    public Patient getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (isPatient(user) && !patientService.isPatientRecord(user.getEmail(), id)) {
            throw new org.springframework.security.access.AccessDeniedException("Patients can only view their own record");
        }
        return patientService.getById(id);
    }

    private boolean isPatient(User user) {
        return user != null && "PATIENT".equalsIgnoreCase(user.getRole());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Patient create(@Valid @RequestBody Patient patient) {
        return patientService.create(patient);
    }

    @PutMapping("/{id}")
    public Patient update(@PathVariable Long id, @RequestBody Patient patient) {
        return patientService.update(id, patient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        patientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/allergies")
    public List<String> getAllergies(@PathVariable Long id) {
        return patientService.getAllergies(id);
    }

    @GetMapping("/{id}/prescriptions")
    public List<Prescription> getPrescriptions(@PathVariable Long id) {
        return patientService.getPrescriptions(id);
    }

    @GetMapping("/{id}/appointments")
    public List<Appointment> getAppointments(@PathVariable Long id) {
        return patientService.getAppointments(id);
    }

    /** Historical readings persisted from the live /ws/vitals/{id} feed, most recent first. */
    @GetMapping("/{id}/vitals")
    public List<Vitals> getVitals(@PathVariable Long id) {
        return patientService.getVitals(id);
    }
}
