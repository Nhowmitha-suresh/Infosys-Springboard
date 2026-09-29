package com.medisphere.backend.controller;

import com.medisphere.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * GET /api/dashboard/summary?role=... -> role-specific dashboard metrics.
 * Contract matches src/api/dashboardService.js.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public Map<String, Object> summary(@RequestParam(required = false) String role) {
        return dashboardService.summary(role);
    }
}
