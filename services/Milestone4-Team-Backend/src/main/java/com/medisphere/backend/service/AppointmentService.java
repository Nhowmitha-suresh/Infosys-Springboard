package com.medisphere.backend.service;

import com.medisphere.backend.entity.Appointment;
import com.medisphere.backend.exception.ResourceNotFoundException;
import com.medisphere.backend.repository.AppointmentRepository;
import com.medisphere.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Full appointment booking/management CRUD.
 * Reuses the existing {@link Appointment} entity and {@link AppointmentRepository}
 * (previously only used for read-only appointment history).
 */
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment " + id + " not found"));
    }

    public Appointment create(Appointment appointment) {
        appointment.setId(null);
        if (appointment.getStatus() == null) {
            appointment.setStatus("Pending");
        }
        validatePatient(appointment.getPatientId());
        return appointmentRepository.save(appointment);
    }

    public Appointment update(Long id, Appointment updates) {
        Appointment existing = getById(id);
        if (updates.getPatientId() != null) existing.setPatientId(updates.getPatientId());
        if (updates.getPatient() != null) existing.setPatient(updates.getPatient());
        if (updates.getDoctor() != null) existing.setDoctor(updates.getDoctor());
        if (updates.getDate() != null) existing.setDate(updates.getDate());
        if (updates.getTime() != null) existing.setTime(updates.getTime());
        if (updates.getType() != null) existing.setType(updates.getType());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        return appointmentRepository.save(existing);
    }

    public Appointment updateStatus(Long id, String status) {
        Appointment existing = getById(id);
        existing.setStatus(status);
        return appointmentRepository.save(existing);
    }

    public void delete(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment " + id + " not found");
        }
        appointmentRepository.deleteById(id);
    }

    private void validatePatient(Long patientId) {
        if (patientId != null && !patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient " + patientId + " not found");
        }
    }
}
