package com.medisphere.backend.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Tracks which open WebSocket sessions are watching which patient, so
 * {@link com.medisphere.backend.service.VitalsStreamConsumer} knows who
 * to forward each Kafka message to. Multiple staff/devices can watch
 * the same patient at once (e.g. a nurse's tablet + a doctor's laptop).
 */
@Component
public class VitalsSessionRegistry {

    private final ConcurrentHashMap<String, Set<WebSocketSession>> sessionsByPatient = new ConcurrentHashMap<>();

    public void register(String patientId, WebSocketSession session) {
        sessionsByPatient.computeIfAbsent(patientId, k -> new CopyOnWriteArraySet<>()).add(session);
    }

    /** @return true if that was the last session watching this patient (caller can stop the feed). */
    public boolean unregister(String patientId, WebSocketSession session) {
        Set<WebSocketSession> sessions = sessionsByPatient.get(patientId);
        if (sessions == null) return true;
        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByPatient.remove(patientId);
            return true;
        }
        return false;
    }

    public Set<WebSocketSession> sessionsFor(String patientId) {
        return sessionsByPatient.getOrDefault(patientId, Set.of());
    }
}
