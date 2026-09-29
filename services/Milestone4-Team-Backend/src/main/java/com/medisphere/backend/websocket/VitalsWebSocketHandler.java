package com.medisphere.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medisphere.backend.service.VitalsService;
import com.medisphere.backend.service.VitalsStreamProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.Instant;
import java.util.Map;

/**
 * Live vitals feed over WebSocket, one connection per viewer per patient.
 *
 * This handler no longer generates any data itself — it just:
 *   1. registers the session in {@link VitalsSessionRegistry} so
 *      {@link com.medisphere.backend.service.VitalsStreamConsumer} knows
 *      where to forward Kafka messages for this patient, and
 *   2. tells {@link VitalsStreamProducer} someone is watching, so it
 *      starts (or keeps running) the simulated feed for this patient on
 *      the "vitals.raw" Kafka topic.
 *
 * The actual data path is:
 *   VitalsStreamProducer -> Kafka topic "vitals.raw" -> VitalsStreamConsumer
 *   -> (persist to DB) + (push to every session in VitalsSessionRegistry)
 *
 * Swapping the simulated producer for real bedside monitors later needs
 * zero changes here or on the frontend.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VitalsWebSocketHandler extends TextWebSocketHandler {

    private final VitalsSessionRegistry sessionRegistry;
    private final VitalsStreamProducer streamProducer;
    private final VitalsService vitalsService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String patientId = extractPatientId(session);
        sessionRegistry.register(patientId, session);
        streamProducer.addViewer(patientId);

        // Send the most recent persisted reading immediately, so the UI
        // isn't empty while waiting for the next tick from Kafka.
        sendLatestKnownReading(session, patientId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String patientId = extractPatientId(session);
        boolean lastViewer = sessionRegistry.unregister(patientId, session);
        if (lastViewer) {
            streamProducer.removeViewer(patientId);
        }
    }

    private void sendLatestKnownReading(WebSocketSession session, String patientId) {
        try {
            Long id = Long.parseLong(patientId);
            vitalsService.getLatest(id).ifPresent(v -> {
                try {
                    Map<String, Object> payload = Map.of(
                            "patientId", patientId,
                            "heartRate", v.getHeartRate(),
                            "spo2", v.getSpo2(),
                            "systolic", v.getSystolicBp(),
                            "diastolic", v.getDiastolicBp(),
                            "temp", v.getTemperature(),
                            "ts", v.getRecordedAt() != null ? v.getRecordedAt().toString() : Instant.now().toString()
                    );
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
                    }
                } catch (Exception e) {
                    log.debug("Could not send initial vitals snapshot: {}", e.getMessage());
                }
            });
        } catch (NumberFormatException ignored) {
            // Not a numeric patient id — nothing persisted to send.
        }
    }

    private String extractPatientId(WebSocketSession session) {
        Map<String, Object> attrs = session.getAttributes();
        // Path variable extraction: WebSocketConfig's interceptor stashes it here.
        Object fromTemplate = attrs.get("patientId");
        if (fromTemplate != null) return fromTemplate.toString();

        String path = session.getUri() != null ? session.getUri().getPath() : "";
        String[] parts = path.split("/");
        return parts.length > 0 ? parts[parts.length - 1] : "unknown";
    }
}
