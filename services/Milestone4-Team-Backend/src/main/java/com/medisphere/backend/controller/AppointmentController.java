package com.medisphere.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.medisphere.backend.entity.Appointment;
import com.medisphere.backend.entity.Patient;
import com.medisphere.backend.entity.User;
import com.medisphere.backend.service.AppointmentService;
import com.medisphere.backend.service.PatientService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * Full appointment booking/management CRUD.
 * Contract matches src/api/appointmentService.js:
 *   GET    /api/appointments
 *   POST   /api/appointments
 *   PUT    /api/appointments/{id}
 *   PATCH  /api/appointments/{id}/status   { status }
 *   DELETE /api/appointments/{id}
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PatientService patientService;

    @GetMapping
    public List<Appointment> getAll(@AuthenticationPrincipal User user) {
        List<Appointment> appointments = appointmentService.getAll();
        if (isPatient(user)) {
            return patientService.getByEmail(user.getEmail())
                    .map(Patient::getName)
                    .map(name -> appointments.stream().filter(appointment -> name.equals(appointment.getPatient())).toList())
                    .orElseGet(List::of);
        }
        return appointments;
    }

    @GetMapping("/{id}")
    public Appointment getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Appointment appointment = appointmentService.getById(id);
        if (isPatient(user) && patientService.getByEmail(user.getEmail())
                .map(patient -> !patient.getName().equals(appointment.getPatient()))
                .orElse(true)) {
            throw new org.springframework.security.access.AccessDeniedException("Patients can only view their own appointments");
        }
        return appointment;
    }

    private boolean isPatient(User user) {
        return user != null && "PATIENT".equalsIgnoreCase(user.getRole());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Appointment create(@Valid @RequestBody Appointment appointment) {
        return appointmentService.create(appointment);
    }

    @PutMapping("/{id}")
    public Appointment update(@PathVariable Long id, @RequestBody Appointment appointment) {
        return appointmentService.update(id, appointment);
    }

    @PatchMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return appointmentService.updateStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
