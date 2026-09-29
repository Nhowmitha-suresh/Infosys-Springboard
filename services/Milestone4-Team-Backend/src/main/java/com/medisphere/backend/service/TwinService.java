package com.medisphere.backend.service;

import com.medisphere.backend.entity.Patient;
import com.medisphere.backend.entity.Twin;
import com.medisphere.backend.exception.ResourceNotFoundException;
import com.medisphere.backend.repository.PatientRepository;
import com.medisphere.backend.repository.PrescriptionRepository;
import com.medisphere.backend.repository.TwinRepository;
import com.medisphere.backend.repository.VitalsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A patient's Digital Health Twin is provisioned lazily: the first time
 * it's requested for a patient, a Twin row is created and "synced".
 * Re-syncing just refreshes the resource count / timestamp — there's no
 * real FHIR server behind this yet, but the contract is real so a real
 * FHIR client can be dropped in later without touching callers.
 */
@Service
@RequiredArgsConstructor
public class TwinService {

    private final TwinRepository twinRepository;
    private final PatientRepository patientRepository;
    private final VitalsRepository vitalsRepository;
    private final PrescriptionRepository prescriptionRepository;

    public List<Twin> getAll() {
        return twinRepository.findAll();
    }

    public Twin getByPatientId(Long patientId) {
        return twinRepository.findByPatientId(patientId)
                .orElseGet(() -> provision(patientId));
    }

    public Twin sync(Long patientId) {
        Twin twin = twinRepository.findByPatientId(patientId).orElseGet(() -> provision(patientId));
        return refresh(twin);
    }

    private Twin provision(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient " + patientId + " not found"));
        Twin twin = new Twin();
        twin.setPatientId(patient.getId());
        twin.setCreatedAt(LocalDateTime.now());
        return refresh(twin);
    }

    private Twin refresh(Twin twin) {
        int vitalsCount = vitalsRepository.findByPatientIdOrderByRecordedAtDesc(twin.getPatientId()).size();
        int prescriptionsCount = prescriptionRepository.findByPatientIdOrderByDateDesc(twin.getPatientId()).size();
        twin.setFhirSyncStatus("Synced");
        twin.setFhirResourceCount(vitalsCount + prescriptionsCount + 1); // +1 for the Patient resource itself
        twin.setLastSyncedAt(LocalDateTime.now());
        return twinRepository.save(twin);
    }

    /** Powers the Twin Dashboard stat cards with real numbers instead of hardcoded ones. */
    public Map<String, Object> summary() {
        long totalPatients = patientRepository.count();
        long twinsCreated = twinRepository.count();
        long fhirResources = twinRepository.findAll().stream()
                .mapToLong(t -> t.getFhirResourceCount() == null ? 0 : t.getFhirResourceCount())
                .sum();

        Map<String, Object> result = new HashMap<>();
        result.put("patientsOnboarded", totalPatients);
        result.put("twinsCreated", twinsCreated);
        result.put("fhirResourcesSynced", fhirResources);
        result.put("twinCoveragePercent", totalPatients == 0 ? 0
                : Math.round((twinsCreated * 10000.0) / totalPatients) / 100.0);
        return result;
    }
}
