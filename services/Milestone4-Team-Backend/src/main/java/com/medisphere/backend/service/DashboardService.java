package com.medisphere.backend.service;

import com.medisphere.backend.entity.Appointment;
import com.medisphere.backend.entity.Patient;
import com.medisphere.backend.repository.AppointmentRepository;
import com.medisphere.backend.repository.PatientRepository;
import com.medisphere.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Produces the summary payload consumed by the role dashboards.
 * Contract matches src/api/dashboardService.js:
 *   GET /api/dashboard/summary?role=ADMIN|DOCTOR|PATIENT|RECEPTIONIST
 *   -> { totalPatients, todaysAppointments, activeDoctors, pendingApprovals,
 *        recentAppointments, recentPatients }
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public Map<String, Object> summary(String role) {
        List<Patient> patients = patientRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();

        LocalDate today = LocalDate.now();

        long totalPatients = patients.size();
        long todaysAppointments = appointments.stream()
                .filter(a -> a.getDate() != null && a.getDate().isEqual(today))
                .count();
        long activeDoctors = userRepository.findAll().stream()
                .filter(u -> "DOCTOR".equalsIgnoreCase(u.getRole()))
                .count();
        long pendingApprovals = appointments.stream()
                .filter(a -> "Pending".equalsIgnoreCase(a.getStatus()))
                .count();

        List<Appointment> recentAppointments = appointments.stream()
                .sorted((a, b) -> {
                    int c = (b.getDate() == null ? LocalDate.MIN : b.getDate())
                            .compareTo(a.getDate() == null ? LocalDate.MIN : a.getDate());
                    if (c != 0) return c;
                    return (a.getTime() == null ? "" : a.getTime())
                            .compareTo(b.getTime() == null ? "" : b.getTime());
                })
                .limit(5)
                .toList();

List<Patient> recentPatients = patients.stream()
                .sorted((a, b) -> Long.compare(
                        b.getId() == null ? 0L : b.getId(),
                        a.getId() == null ? 0L : a.getId()))
                .limit(5)
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("totalPatients", totalPatients);
        result.put("todaysAppointments", todaysAppointments);
        result.put("activeDoctors", activeDoctors);
        result.put("pendingApprovals", pendingApprovals);
        result.put("recentAppointments", recentAppointments);
        result.put("recentPatients", recentPatients);
        return result;
    }
}
