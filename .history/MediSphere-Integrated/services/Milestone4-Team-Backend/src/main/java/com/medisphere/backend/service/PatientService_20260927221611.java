package com.medisphere.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.medisphere.backend.entity.Allergy;
import com.medisphere.backend.entity.Appointment;
import com.medisphere.backend.entity.Patient;
import com.medisphere.backend.entity.Prescription;
import com.medisphere.backend.entity.Vitals;
import com.medisphere.backend.exception.ResourceNotFoundException;
import com.medisphere.backend.repository.AllergyRepository;
import com.medisphere.backend.repository.AppointmentRepository;
import com.medisphere.backend.repository.PatientRepository;
import com.medisphere.backend.repository.PrescriptionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final AllergyRepository allergyRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final VitalsService vitalsService;

    public List<Patient> getAll() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getByEmail(String email) {
        return patientRepository.findByEmailIgnoreCase(email);
    }

    public boolean isPatientRecord(String email, Long patientId) {
        return patientRepository.findByEmailIgnoreCase(email)
                .map(patient -> patient.getId().equals(patientId))
                .orElse(false);
    }

    public Patient getById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient " + id + " not found"));
    }

    public Patient create(Patient patient) {
        patient.setId(null);
        if (patient.getStatus() == null) patient.setStatus("Active");
        return patientRepository.save(patient);
    }

    public Patient update(Long id, Patient updates) {
        Patient existing = getById(id);
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getAge() != null) existing.setAge(updates.getAge());
        if (updates.getGender() != null) existing.setGender(updates.getGender());
        if (updates.getPhone() != null) existing.setPhone(updates.getPhone());
        if (updates.getBloodGroup() != null) existing.setBloodGroup(updates.getBloodGroup());
        if (updates.getCondition() != null) existing.setCondition(updates.getCondition());
        if (updates.getLastVisit() != null) existing.setLastVisit(updates.getLastVisit());
        if (updates.getDoctor() != null) existing.setDoctor(updates.getDoctor());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        return patientRepository.save(existing);
    }

    public void delete(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient " + id + " not found");
        }
        patientRepository.deleteById(id);
    }

    public List<String> getAllergies(Long patientId) {
        getById(patientId); // 404 if patient doesn't exist
        List<String> names = allergyRepository.findByPatientId(patientId)
                .stream().map(Allergy::getName).toList();
        return names.isEmpty() ? List.of("None reported") : names;
    }

    public List<Prescription> getPrescriptions(Long patientId) {
        getById(patientId);
        return prescriptionRepository.findByPatientIdOrderByDateDesc(patientId);
    }

    public List<Appointment> getAppointments(Long patientId) {
        getById(patientId);
        return appointmentRepository.findByPatientIdOrderByDateDesc(patientId);
    }

    public List<Vitals> getVitals(Long patientId) {
        getById(patientId); // 404 if patient doesn't exist
        return vitalsService.getHistory(patientId);
    }
}
