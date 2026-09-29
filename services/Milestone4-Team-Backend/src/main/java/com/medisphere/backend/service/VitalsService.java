package com.medisphere.backend.service;

import com.medisphere.backend.entity.Vitals;
import com.medisphere.backend.repository.VitalsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VitalsService {

    private final VitalsRepository vitalsRepository;

    /** Called from VitalsWebSocketHandler on every simulated (or, later, real) reading. */
    public Vitals recordReading(Long patientId, Integer heartRate, Integer spo2,
                                 Integer systolicBp, Integer diastolicBp, BigDecimal temperature) {
        Vitals vitals = new Vitals();
        vitals.setPatientId(patientId);
        vitals.setHeartRate(heartRate);
        vitals.setSpo2(spo2);
        vitals.setSystolicBp(systolicBp);
        vitals.setDiastolicBp(diastolicBp);
        vitals.setTemperature(temperature);
        vitals.setRecordedAt(LocalDateTime.now());
        return vitalsRepository.save(vitals);
    }

    public List<Vitals> getHistory(Long patientId) {
        return vitalsRepository.findByPatientIdOrderByRecordedAtDesc(patientId);
    }

    public Optional<Vitals> getLatest(Long patientId) {
        return vitalsRepository.findFirstByPatientIdOrderByRecordedAtDesc(patientId);
    }
}
