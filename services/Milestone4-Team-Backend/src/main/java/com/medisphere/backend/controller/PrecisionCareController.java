package com.medisphere.backend.controller;

import com.medisphere.backend.entity.ClinicalGuideline;
import com.medisphere.backend.entity.CollaborationMessage;
import com.medisphere.backend.entity.CollaborationTask;
import com.medisphere.backend.entity.CareTeamMember;
import com.medisphere.backend.entity.PrecisionCarePlan;
import com.medisphere.backend.service.PrecisionCareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Milestone 4 — Precision Care Management.
 *
 *   GET   /api/precision-care/summary                       -> KPI aggregate across all plans
 *   GET   /api/precision-care/careplan/{patientId}           -> { plan, patientName, goals }
 *   POST  /api/precision-care/careplan/{patientId}/approve   -> PrecisionCarePlan
 *   POST  /api/precision-care/careplan/{patientId}/send      -> PrecisionCarePlan
 *   GET   /api/precision-care/outcomes/{patientId}           -> { metrics, cvdRiskTrend, milestones }
 *   GET   /api/precision-care/guidelines/{patientId}?status= -> ClinicalGuideline[]
 *   PATCH /api/precision-care/guidelines/{id}/review         -> ClinicalGuideline
 *   GET   /api/precision-care/team/{patientId}               -> CareTeamMember[]
 *   GET   /api/precision-care/activity/{patientId}           -> CollaborationMessage[]
 *   POST  /api/precision-care/activity/{patientId}           -> CollaborationMessage
 *   GET   /api/precision-care/tasks/{patientId}              -> CollaborationTask[]
 *   PATCH /api/precision-care/tasks/{id}/toggle              -> CollaborationTask
 */
@RestController
@RequestMapping("/api/precision-care")
@RequiredArgsConstructor
public class PrecisionCareController {

    private final PrecisionCareService precisionCareService;

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return precisionCareService.summary();
    }

    @GetMapping("/careplan/{patientId}")
    public Map<String, Object> getCarePlan(@PathVariable Long patientId) {
        return precisionCareService.getCarePlan(patientId);
    }

    @PostMapping("/careplan/{patientId}/approve")
    public PrecisionCarePlan approvePlan(@PathVariable Long patientId) {
        return precisionCareService.approvePlan(patientId);
    }

    @PostMapping("/careplan/{patientId}/send")
    public PrecisionCarePlan sendPlanToPatient(@PathVariable Long patientId) {
        return precisionCareService.sendPlanToPatient(patientId);
    }

    @GetMapping("/outcomes/{patientId}")
    public Map<String, Object> getOutcomes(@PathVariable Long patientId) {
        return precisionCareService.getOutcomes(patientId);
    }

    @GetMapping("/guidelines/{patientId}")
    public List<ClinicalGuideline> getGuidelines(@PathVariable Long patientId,
                                                  @RequestParam(required = false) String status) {
        return precisionCareService.getGuidelines(patientId, status);
    }

    @PatchMapping("/guidelines/{id}/review")
    public ClinicalGuideline reviewGuideline(@PathVariable Long id) {
        return precisionCareService.reviewGuideline(id);
    }

    @GetMapping("/team/{patientId}")
    public List<CareTeamMember> getTeam(@PathVariable Long patientId) {
        return precisionCareService.getTeam(patientId);
    }

    @GetMapping("/activity/{patientId}")
    public List<CollaborationMessage> getActivity(@PathVariable Long patientId) {
        return precisionCareService.getActivity(patientId);
    }

    @PostMapping("/activity/{patientId}")
    public CollaborationMessage addActivityMessage(@PathVariable Long patientId,
                                                    @Valid @RequestBody CollaborationMessage message) {
        return precisionCareService.addActivityMessage(patientId, message);
    }

    @GetMapping("/tasks/{patientId}")
    public List<CollaborationTask> getTasks(@PathVariable Long patientId) {
        return precisionCareService.getTasks(patientId);
    }

    @PatchMapping("/tasks/{id}/toggle")
    public CollaborationTask toggleTask(@PathVariable Long id) {
        return precisionCareService.toggleTask(id);
    }
}
