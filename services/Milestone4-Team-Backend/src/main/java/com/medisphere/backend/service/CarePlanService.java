package com.medisphere.backend.service;

import com.medisphere.backend.entity.CarePlan;
import com.medisphere.backend.entity.Patient;
import com.medisphere.backend.exception.ResourceNotFoundException;
import com.medisphere.backend.repository.CarePlanRepository;
import com.medisphere.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarePlanService {

    private final CarePlanRepository carePlanRepository;
    private final PatientRepository patientRepository;

    public List<CarePlan> getAll() {
        return carePlanRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<CarePlan> getByPatient(Long patientId) {
        getPatient(patientId);
        return carePlanRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public CarePlan getById(Long id) {
        return carePlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CarePlan " + id + " not found"));
    }

    public CarePlan create(CarePlan carePlan) {
        Patient patient = getPatient(carePlan.getPatientId());
        carePlan.setId(null);
        if (carePlan.getPatientName() == null) carePlan.setPatientName(patient.getName());
        if (carePlan.getAssignedDoctor() == null) carePlan.setAssignedDoctor(patient.getDoctor());
        if (carePlan.getStatus() == null) carePlan.setStatus("Active");
        carePlan.setCreatedAt(LocalDateTime.now());
        return carePlanRepository.save(carePlan);
    }

    public CarePlan update(Long id, CarePlan updates) {
        CarePlan existing = getById(id);
        if (updates.getTitle() != null) existing.setTitle(updates.getTitle());
        if (updates.getAssignedDoctor() != null) existing.setAssignedDoctor(updates.getAssignedDoctor());
        if (updates.getNotes() != null) existing.setNotes(updates.getNotes());
        if (updates.getFollowUpDate() != null) existing.setFollowUpDate(updates.getFollowUpDate());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        return carePlanRepository.save(existing);
    }

    public CarePlan updateStatus(Long id, String status) {
        CarePlan existing = getById(id);
        existing.setStatus(status);
        return carePlanRepository.save(existing);
    }

    public void delete(Long id) {
        if (!carePlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("CarePlan " + id + " not found");
        }
        carePlanRepository.deleteById(id);
    }

    public long countActive() {
        return carePlanRepository.countByStatus("Active");
    }

    private Patient getPatient(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient " + patientId + " not found"));
    }
}
