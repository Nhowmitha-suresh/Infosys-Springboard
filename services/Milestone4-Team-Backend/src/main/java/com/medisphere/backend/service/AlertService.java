package com.medisphere.backend.service;

import com.medisphere.backend.entity.Alert;
import com.medisphere.backend.entity.Patient;
import com.medisphere.backend.entity.Vitals;
import com.medisphere.backend.exception.ResourceNotFoundException;
import com.medisphere.backend.repository.AlertRepository;
import com.medisphere.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final PatientRepository patientRepository;

    public List<Alert> getAll() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Alert> getByPatient(Long patientId) {
        getPatient(patientId);
        return alertRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public List<Alert> getUnacknowledged() {
        return alertRepository.findByAcknowledgedFalseOrderByCreatedAtDesc();
    }

    public Alert getById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert " + id + " not found"));
    }

    public Alert create(Alert alert) {
        Patient patient = getPatient(alert.getPatientId());

        alert.setId(null);

        if (alert.getPatientName() == null) {
            alert.setPatientName(patient.getName());
        }

        if (alert.getSource() == null) {
            alert.setSource("Manual");
        }

        alert.setAcknowledged(false);
        alert.setCreatedAt(LocalDateTime.now());

        return alertRepository.save(alert);
    }

    public Alert acknowledge(Long id, String acknowledgedBy) {
        Alert alert = getById(id);

        alert.setAcknowledged(true);
        alert.setAcknowledgedBy(acknowledgedBy);
        alert.setAcknowledgedAt(LocalDateTime.now());

        return alertRepository.save(alert);
    }

    public void delete(Long id) {
        if (!alertRepository.existsById(id)) {
            throw new ResourceNotFoundException("Alert " + id + " not found");
        }

        alertRepository.deleteById(id);
    }

    public long countUnacknowledged() {
        return alertRepository.countByAcknowledgedFalse();
    }

    private Patient getPatient(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient " + patientId + " not found"));
    }

    /**
     * Threshold-based auto-alerting, called from the Kafka vitals stream
     * so every abnormal reading that flows through the live feed raises
     * a real alert automatically.
     */
    public void evaluateVitals(Long patientId, Vitals v) {

        StringBuilder reasons = new StringBuilder();
        String severity = "Warning";

        // Heart rate
        if (v.getHeartRate() != null &&
                (v.getHeartRate() < 45 || v.getHeartRate() > 130)) {

            reasons.append("Heart rate ")
                    .append(v.getHeartRate())
                    .append(" bpm out of safe range. ");

            severity = "Critical";

        } else if (v.getHeartRate() != null &&
                (v.getHeartRate() < 55 || v.getHeartRate() > 110)) {

            reasons.append("Heart rate ")
                    .append(v.getHeartRate())
                    .append(" bpm elevated/low. ");
        }

        // SpO2
        if (v.getSpo2() != null && v.getSpo2() < 90) {

            reasons.append("SpO2 ")
                    .append(v.getSpo2())
                    .append("% critically low. ");

            severity = "Critical";

        } else if (v.getSpo2() != null && v.getSpo2() < 94) {

            reasons.append("SpO2 ")
                    .append(v.getSpo2())
                    .append("% below normal. ");
        }

        // Systolic blood pressure
        if (v.getSystolicBp() != null &&
                (v.getSystolicBp() > 160 || v.getSystolicBp() < 85)) {

            reasons.append("Systolic BP ")
                    .append(v.getSystolicBp())
                    .append(" mmHg out of safe range. ");

            severity = "Critical";

        } else if (v.getSystolicBp() != null &&
                v.getSystolicBp() > 140) {

            reasons.append("Systolic BP ")
                    .append(v.getSystolicBp())
                    .append(" mmHg elevated. ");
        }

        // Temperature
        if (v.getTemperature() != null &&
                v.getTemperature().doubleValue() >= 39.0) {

            reasons.append("Temperature ")
                    .append(v.getTemperature())
                    .append("\u00b0C — high fever. ");

            severity = "Critical";

        } else if (v.getTemperature() != null &&
                v.getTemperature().doubleValue() >= 38.0) {

            reasons.append("Temperature ")
                    .append(v.getTemperature())
                    .append("\u00b0C elevated. ");
        }

        // No abnormal values
        if (reasons.length() == 0) {
            return;
        }

        /*
         * Debounce:
         * Don't create a new alert every few seconds while a patient's
         * vitals remain abnormal.
         *
         * Only one unacknowledged Vitals alert is created within 5 minutes.
         */
        boolean alreadyOpen =
                alertRepository.existsByPatientIdAndSourceAndAcknowledgedFalseAndCreatedAtAfter(
                        patientId,
                        "Vitals",
                        LocalDateTime.now().minusMinutes(5)
                );

        if (alreadyOpen) {
            return;
        }

        /*
         * Create final copies because these values are used inside
         * the lambda expression below.
         */
        final String finalSeverity = severity;
        final String finalMessage = reasons.toString().trim();

        patientRepository.findById(patientId).ifPresent(patient -> {

            Alert alert = new Alert();

            alert.setPatientId(patientId);
            alert.setPatientName(patient.getName());
            alert.setSeverity(finalSeverity);
            alert.setTitle("Abnormal vitals detected");
            alert.setMessage(finalMessage);
            alert.setSource("Vitals");
            alert.setAcknowledged(false);
            alert.setCreatedAt(LocalDateTime.now());

            alertRepository.save(alert);
        });
    }
}