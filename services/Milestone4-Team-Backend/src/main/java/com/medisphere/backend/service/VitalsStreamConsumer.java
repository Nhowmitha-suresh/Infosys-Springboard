package com.medisphere.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medisphere.backend.dto.VitalsReading;
import com.medisphere.backend.entity.Vitals;
import com.medisphere.backend.websocket.VitalsSessionRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * The Kafka -> WebSocket bridge. Consumes every reading published to
 * "vitals.raw" (by {@link VitalsStreamProducer} today, or a real
 * monitor-ingestion service later), persists it via
 * {@link VitalsService}, and pushes it out to any browser currently
 * watching that patient.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VitalsStreamConsumer {

    private final VitalsService vitalsService;
    private final VitalsSessionRegistry sessionRegistry;
    private final AlertService alertService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "${app.kafka.vitals-topic}", groupId = "${spring.kafka.consumer.group-id}")
    public void onReading(VitalsReading reading) {
        persist(reading);
        broadcast(reading);
    }

    private void persist(VitalsReading reading) {
        try {
            Long patientId = Long.parseLong(reading.getPatientId());
            BigDecimal temperature = BigDecimal.valueOf(reading.getTemp()).setScale(1, RoundingMode.HALF_UP);
            Vitals saved = vitalsService.recordReading(
                    patientId,
                    (int) reading.getHeartRate(),
                    (int) reading.getSpo2(),
                    (int) reading.getSystolic(),
                    (int) reading.getDiastolic(),
                    temperature
            );
            alertService.evaluateVitals(patientId, saved);
        } catch (NumberFormatException e) {
            // Not a numeric patient id (e.g. a demo/test session) — nothing to persist.
        } catch (Exception e) {
            log.warn("Failed to persist vitals reading for patient {}: {}", reading.getPatientId(), e.getMessage());
        }
    }

    private void broadcast(VitalsReading reading) {
        for (WebSocketSession session : sessionRegistry.sessionsFor(reading.getPatientId())) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(reading)));
                }
            } catch (Exception e) {
                log.debug("Dropping vitals message for a closed/broken session: {}", e.getMessage());
            }
        }
    }
}
