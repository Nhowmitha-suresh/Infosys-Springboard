package com.medisphere.backend.service;

import com.medisphere.backend.entity.Alert;
import com.medisphere.backend.entity.Patient;
import com.medisphere.backend.entity.Prediction;
import com.medisphere.backend.entity.Vitals;
import com.medisphere.backend.exception.ResourceNotFoundException;
import com.medisphere.backend.repository.PatientRepository;
import com.medisphere.backend.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Runs a transparent, explainable heuristic risk score against a
 * patient's condition + latest vitals. This is NOT a real clinical
 * model — it's a rules engine that stands in for one, so the rest of
 * the stack (persistence, API, alerting, UI) is real and a genuine
 * ML model can be swapped in later behind the same {@link #run} contract.
 */
@Service
@RequiredArgsConstructor
public class PredictionService {

    private static final String MODEL_VERSION = "heuristic-v1";

    private final PredictionRepository predictionRepository;
    private final PatientRepository patientRepository;
    private final VitalsService vitalsService;
    private final AlertService alertService;

    public List<Prediction> getAll() {
        return predictionRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Prediction> getByPatient(Long patientId) {
        getPatient(patientId);
        return predictionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public Prediction getById(Long id) {
        return predictionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prediction " + id + " not found"));
    }

    public void delete(Long id) {
        if (!predictionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Prediction " + id + " not found");
        }
        predictionRepository.deleteById(id);
    }

    public Prediction run(Long patientId) {
        Patient patient = getPatient(patientId);
        Vitals latest = vitalsService.getLatest(patientId).orElse(null);

        double score = 4.0; // baseline
        List<String> factors = new ArrayList<>();

        String condition = patient.getCondition() == null ? "" : patient.getCondition().toLowerCase();
        if (condition.contains("hypertension")) { score += 6; factors.add("Hypertension"); }
        if (condition.contains("diabetes")) { score += 5; factors.add("Diabetes"); }
        if (condition.contains("cardiac") || condition.contains("heart")) { score += 8; factors.add("Cardiac history"); }
        if (condition.contains("post-surgery") || condition.contains("surgery")) { score += 3; factors.add("Recent surgery"); }

        if (patient.getAge() != null) {
            if (patient.getAge() >= 65) { score += 7; factors.add("Age \u2265 65"); }
            else if (patient.getAge() >= 45) { score += 3; factors.add("Age \u2265 45"); }
        }

        if (latest != null) {
            if (latest.getSystolicBp() != null && latest.getSystolicBp() > 140) {
                score += 6; factors.add("Elevated systolic BP (" + latest.getSystolicBp() + " mmHg)");
            }
            if (latest.getHeartRate() != null && (latest.getHeartRate() > 100 || latest.getHeartRate() < 55)) {
                score += 4; factors.add("Abnormal heart rate (" + latest.getHeartRate() + " bpm)");
            }
            if (latest.getSpo2() != null && latest.getSpo2() < 94) {
                score += 5; factors.add("Low SpO2 (" + latest.getSpo2() + "%)");
            }
        } else {
            factors.add("No recent vitals on file — score based on history only");
        }

        double riskPercent = Math.min(95.0, Math.round(score * 10.0) / 10.0);
        String riskLevel = riskPercent >= 40 ? "High" : riskPercent >= 15 ? "Moderate" : "Low";

        Prediction prediction = new Prediction();
        prediction.setPatientId(patientId);
        prediction.setRiskType("12-month adverse cardiac event risk");
        prediction.setRiskPercent(riskPercent);
        prediction.setRiskLevel(riskLevel);
        prediction.setFactors(factors.isEmpty() ? "No significant risk factors identified" : String.join(", ", factors));
        prediction.setModelVersion(MODEL_VERSION);
        prediction.setCreatedAt(LocalDateTime.now());
        Prediction saved = predictionRepository.save(prediction);

        if ("High".equals(riskLevel)) {
            Alert alert = new Alert();
            alert.setPatientId(patientId);
            alert.setPatientName(patient.getName());
            alert.setSeverity("Warning");
            alert.setTitle("High-risk prediction generated");
            alert.setMessage("Predicted " + riskPercent + "% " + saved.getRiskType() + ". Factors: " + saved.getFactors());
            alert.setSource("Prediction");
            alertService.create(alert);
        }

        return saved;
    }

    private Patient getPatient(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient " + patientId + " not found"));
    }
}
