package com.medisphere.backend.service;

import com.medisphere.backend.entity.*;
import com.medisphere.backend.exception.BadRequestException;
import com.medisphere.backend.exception.ResourceNotFoundException;
import com.medisphere.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

/**
 * Generates a point-in-time report by pulling together everything on
 * file for a patient (demographics, vitals, prescriptions, appointments,
 * predictions, care plans) into one persisted, retrievable document.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private static final Set<String> VALID_TYPES = Set.of("Summary", "Vitals", "Predictions", "CarePlan");

    private final ReportRepository reportRepository;
    private final PatientRepository patientRepository;
    private final VitalsRepository vitalsRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final PredictionRepository predictionRepository;
    private final CarePlanRepository carePlanRepository;
    private final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    public List<Report> getAll() {
        return reportRepository.findAllByOrderByGeneratedAtDesc();
    }

    public List<Report> getByPatient(Long patientId) {
        getPatient(patientId);
        return reportRepository.findByPatientIdOrderByGeneratedAtDesc(patientId);
    }

    public Report getById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report " + id + " not found"));
    }

    public void delete(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new ResourceNotFoundException("Report " + id + " not found");
        }
        reportRepository.deleteById(id);
    }

    public Report generate(Long patientId, String type, String generatedBy) {
        String reportType = (type == null || type.isBlank()) ? "Summary" : type;
        if (!VALID_TYPES.contains(reportType)) {
            throw new BadRequestException("Invalid report type '" + reportType + "'. Valid types: " + VALID_TYPES);
        }
        Patient patient = getPatient(patientId);

        StringBuilder sb = new StringBuilder();
        sb.append("Patient: ").append(patient.getName())
                .append(" | Age: ").append(patient.getAge())
                .append(" | Gender: ").append(patient.getGender())
                .append(" | Condition: ").append(patient.getCondition()).append("\n\n");

        switch (reportType) {
            case "Vitals" -> appendVitals(sb, patientId);
            case "Predictions" -> appendPredictions(sb, patientId);
            case "CarePlan" -> appendCarePlans(sb, patientId);
            default -> {
                appendVitals(sb, patientId);
                appendPrescriptions(sb, patientId);
                appendAppointments(sb, patientId);
                appendPredictions(sb, patientId);
                appendCarePlans(sb, patientId);
            }
        }

        Report report = new Report();
        report.setPatientId(patientId);
        report.setPatientName(patient.getName());
        report.setType(reportType);
        report.setTitle(patient.getName() + " \u2014 " + reportType + " Report");
        report.setContent(sb.toString());
        report.setGeneratedBy(generatedBy == null ? "System" : generatedBy);
        report.setGeneratedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }

    private void appendVitals(StringBuilder sb, Long patientId) {
        List<Vitals> vitals = vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
        sb.append("== Vitals (latest ").append(Math.min(5, vitals.size())).append(" readings) ==\n");
        if (vitals.isEmpty()) {
            sb.append("No vitals recorded.\n");
        } else {
            vitals.stream().limit(5).forEach(v -> sb.append(v.getRecordedAt() == null ? "" : v.getRecordedAt().format(fmt))
                    .append(" \u2014 HR ").append(v.getHeartRate())
                    .append(", BP ").append(v.getSystolicBp()).append("/").append(v.getDiastolicBp())
                    .append(", SpO2 ").append(v.getSpo2()).append("%")
                    .append(", Temp ").append(v.getTemperature()).append("\u00b0C\n"));
        }
        sb.append("\n");
    }

    private void appendPrescriptions(StringBuilder sb, Long patientId) {
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByDateDesc(patientId);
        sb.append("== Prescriptions ==\n");
        if (prescriptions.isEmpty()) sb.append("None on file.\n");
        else prescriptions.forEach(p -> sb.append(p.getDate()).append(" \u2014 ").append(p.getDrug())
                .append(" (").append(p.getDosage()).append("), prescribed by ").append(p.getPrescribedBy()).append("\n"));
        sb.append("\n");
    }

    private void appendAppointments(StringBuilder sb, Long patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByDateDesc(patientId);
        sb.append("== Appointment History ==\n");
        if (appointments.isEmpty()) sb.append("None on file.\n");
        else appointments.forEach(a -> sb.append(a.getDate()).append(" ").append(a.getTime())
                .append(" \u2014 ").append(a.getType()).append(" with ").append(a.getDoctor())
                .append(" (").append(a.getStatus()).append(")\n"));
        sb.append("\n");
    }

    private void appendPredictions(StringBuilder sb, Long patientId) {
        List<Prediction> predictions = predictionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        sb.append("== Risk Predictions ==\n");
        if (predictions.isEmpty()) sb.append("No predictions run yet.\n");
        else predictions.stream().limit(5).forEach(p -> sb.append(p.getCreatedAt() == null ? "" : p.getCreatedAt().format(fmt))
                .append(" \u2014 ").append(p.getRiskType()).append(": ").append(p.getRiskPercent())
                .append("% (").append(p.getRiskLevel()).append("). Factors: ").append(p.getFactors()).append("\n"));
        sb.append("\n");
    }

    private void appendCarePlans(StringBuilder sb, Long patientId) {
        List<CarePlan> plans = carePlanRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        sb.append("== Care Plans ==\n");
        if (plans.isEmpty()) sb.append("No care plans on file.\n");
        else plans.forEach(c -> sb.append(c.getTitle()).append(" \u2014 assigned to ").append(c.getAssignedDoctor())
                .append(", follow-up ").append(c.getFollowUpDate()).append(" (").append(c.getStatus()).append(")\n"));
        sb.append("\n");
    }

    private Patient getPatient(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient " + patientId + " not found"));
    }
}
