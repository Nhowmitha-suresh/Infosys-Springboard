package com.medisphere.backend.service;

import com.medisphere.backend.entity.*;
import com.medisphere.backend.exception.ResourceNotFoundException;
import com.medisphere.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Milestone 4 — Precision Care Management.
 *
 * Backs the "Precision Care" dashboard (AI-assisted risk prediction,
 * personalized care plans, outcome measurement, provider collaboration and
 * clinical guideline compliance) with real data stored in the same
 * PostgreSQL database as every other Milestone 1 feature (patients,
 * appointments, ...) — no mock/hardcoded numbers are served here; every
 * number below comes from a `pc_*` table seeded in data.sql or created
 * through these endpoints.
 *
 * Contract matches src/api/precisionCareService.js.
 */
@Service
@RequiredArgsConstructor
public class PrecisionCareService {

    private final PrecisionCarePlanRepository carePlanRepository;
    private final CarePlanGoalRepository goalRepository;
    private final OutcomeMetricRepository outcomeMetricRepository;
    private final OutcomeTrendPointRepository trendPointRepository;
    private final CareMilestoneRepository milestoneRepository;
    private final ClinicalGuidelineRepository guidelineRepository;
    private final CareTeamMemberRepository teamMemberRepository;
    private final CollaborationMessageRepository messageRepository;
    private final CollaborationTaskRepository taskRepository;
    private final PatientRepository patientRepository;

    private static final double AT_RISK_CVD_THRESHOLD = 15.0;

    // ---------------------------------------------------------------
    // KPI summary
    // ---------------------------------------------------------------

    public Map<String, Object> summary() {
        List<PrecisionCarePlan> plans = carePlanRepository.findAll();

        long patientsAssessed = plans.size();
        long atRiskCohort = carePlanRepository.countByPredictedCvdRiskGreaterThanEqual(AT_RISK_CVD_THRESHOLD);

        double avgConfidence = plans.stream()
                .filter(p -> p.getPredictionConfidence() != null)
                .mapToDouble(PrecisionCarePlan::getPredictionConfidence)
                .average().orElse(0);

        double avgAdherence = plans.stream()
                .filter(p -> p.getAdherenceScore() != null)
                .mapToInt(PrecisionCarePlan::getAdherenceScore)
                .average().orElse(0);

        double avgHospitalizationReduction = plans.stream()
                .filter(p -> p.getHospitalizationRiskReduction() != null)
                .mapToInt(PrecisionCarePlan::getHospitalizationRiskReduction)
                .average().orElse(0);

        Map<String, Object> out = new HashMap<>();
        out.put("patientsAssessed", patientsAssessed);
        out.put("atRiskCohort", atRiskCohort);
        out.put("predictionConfidencePercent", round1(avgConfidence));
        out.put("adherenceRatePercent", round1(avgAdherence));
        out.put("hospitalizationRiskReductionPercent", round1(avgHospitalizationReduction));
        return out;
    }

    // ---------------------------------------------------------------
    // Care plan
    // ---------------------------------------------------------------

    public Map<String, Object> getCarePlan(Long patientId) {
        Patient patient = getPatient(patientId);
        PrecisionCarePlan plan = carePlanRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("No precision care plan for patient " + patientId));
        List<CarePlanGoal> goals = goalRepository.findByCarePlanIdOrderByGoalNumberAsc(plan.getId());

        Map<String, Object> out = new HashMap<>();
        out.put("plan", plan);
        out.put("patientName", patient.getName());
        out.put("goals", goals);
        return out;
    }

    public PrecisionCarePlan approvePlan(Long patientId) {
        PrecisionCarePlan plan = requirePlan(patientId);
        plan.setStatus("Approved");
        plan.setUpdatedAt(LocalDateTime.now());
        return carePlanRepository.save(plan);
    }

    public PrecisionCarePlan sendPlanToPatient(Long patientId) {
        PrecisionCarePlan plan = requirePlan(patientId);
        plan.setStatus("Sent to patient");
        plan.setUpdatedAt(LocalDateTime.now());
        return carePlanRepository.save(plan);
    }

    private PrecisionCarePlan requirePlan(Long patientId) {
        return carePlanRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("No precision care plan for patient " + patientId));
    }

    // ---------------------------------------------------------------
    // Outcomes
    // ---------------------------------------------------------------

    public Map<String, Object> getOutcomes(Long patientId) {
        getPatient(patientId);
        List<OutcomeMetric> metrics = outcomeMetricRepository.findByPatientIdOrderByDisplayOrderAsc(patientId);
        List<OutcomeTrendPoint> trend = trendPointRepository
                .findByPatientIdAndMetricKeyOrderBySequenceAsc(patientId, "cvd_risk");
        List<CareMilestone> milestones = milestoneRepository.findByPatientIdOrderByDisplayOrderAsc(patientId);

        Map<String, Object> out = new HashMap<>();
        out.put("metrics", metrics);
        out.put("cvdRiskTrend", trend);
        out.put("milestones", milestones);
        return out;
    }

    // ---------------------------------------------------------------
    // Clinical guideline compliance
    // ---------------------------------------------------------------

    public List<ClinicalGuideline> getGuidelines(Long patientId, String status) {
        getPatient(patientId);
        if (status == null || status.isBlank() || "all".equalsIgnoreCase(status)) {
            return guidelineRepository.findByPatientIdOrderByIdAsc(patientId);
        }
        return guidelineRepository.findByPatientIdAndStatusOrderByIdAsc(patientId, status);
    }

    public ClinicalGuideline reviewGuideline(Long id) {
        ClinicalGuideline guideline = guidelineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guideline " + id + " not found"));
        guideline.setStatus("compliant");
        guideline.setDetail("Reviewed by care team — " + guideline.getDetail());
        guideline.setUpdatedLabel("Updated just now");
        guideline.setReviewedAt(LocalDateTime.now());
        return guidelineRepository.save(guideline);
    }

    // ---------------------------------------------------------------
    // Provider collaboration
    // ---------------------------------------------------------------

    public List<CareTeamMember> getTeam(Long patientId) {
        getPatient(patientId);
        return teamMemberRepository.findByPatientIdOrderByIdAsc(patientId);
    }

    public List<CollaborationMessage> getActivity(Long patientId) {
        getPatient(patientId);
        return messageRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public CollaborationMessage addActivityMessage(Long patientId, CollaborationMessage message) {
        getPatient(patientId);
        message.setId(null);
        message.setPatientId(patientId);
        if (message.getCreatedAt() == null) message.setCreatedAt(LocalDateTime.now());
        return messageRepository.save(message);
    }

    public List<CollaborationTask> getTasks(Long patientId) {
        getPatient(patientId);
        return taskRepository.findByPatientIdOrderByCreatedAtAsc(patientId);
    }

    public CollaborationTask toggleTask(Long id) {
        CollaborationTask task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task " + id + " not found"));
        task.setDone(!task.isDone());
        return taskRepository.save(task);
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private Patient getPatient(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient " + patientId + " not found"));
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
