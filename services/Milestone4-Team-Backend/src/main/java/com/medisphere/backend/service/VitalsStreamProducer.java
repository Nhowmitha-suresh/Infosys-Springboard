package com.medisphere.backend.service;

import com.medisphere.backend.dto.VitalsReading;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Publishes vitals readings to Kafka for whichever patients currently
 * have at least one viewer (see {@link com.medisphere.backend.websocket.VitalsWebSocketHandler}).
 *
 * This is the piece that stands in for real bedside monitors / wearable
 * devices. Today it's a bounded random walk on a timer, per patient.
 * Swap this class out for a real ingestion adapter (MQTT bridge, HL7
 * interface engine, etc.) later — as long as it publishes the same
 * {@link VitalsReading} JSON shape to the same topic, nothing else in
 * the pipeline (consumer, WebSocket, frontend) needs to change.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VitalsStreamProducer {

    private final KafkaTemplate<String, VitalsReading> kafkaTemplate;

    @Value("${app.kafka.vitals-topic}")
    private String vitalsTopic;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final Map<String, ScheduledFuture<?>> activeFeeds = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> viewerCounts = new ConcurrentHashMap<>();
    private final Map<String, double[]> lastReadingByPatient = new ConcurrentHashMap<>();

    // heartRate, spo2, systolic, diastolic, temp
    private static final double[] BASELINE = {78, 98, 122, 80, 98.4};
    private static final long INTERVAL_SECONDS = 2;

    /** Call when a viewer starts watching a patient. Starts the feed if this is the first viewer. */
    public void addViewer(String patientId) {
        int count = viewerCounts.computeIfAbsent(patientId, k -> new AtomicInteger(0)).incrementAndGet();
        if (count == 1) {
            startFeed(patientId);
        }
    }

    /** Call when a viewer stops watching. Stops the feed once nobody is left watching. */
    public void removeViewer(String patientId) {
        AtomicInteger counter = viewerCounts.get(patientId);
        if (counter == null) return;
        if (counter.decrementAndGet() <= 0) {
            viewerCounts.remove(patientId);
            stopFeed(patientId);
        }
    }

    private void startFeed(String patientId) {
        lastReadingByPatient.put(patientId, BASELINE.clone());
        publishOnce(patientId); // don't make the UI wait a full interval for the first reading

        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(
                () -> publishOnce(patientId), INTERVAL_SECONDS, INTERVAL_SECONDS, TimeUnit.SECONDS
        );
        activeFeeds.put(patientId, future);
    }

    private void stopFeed(String patientId) {
        ScheduledFuture<?> future = activeFeeds.remove(patientId);
        if (future != null) future.cancel(true);
        lastReadingByPatient.remove(patientId);
    }

    private void publishOnce(String patientId) {
        double[] last = lastReadingByPatient.getOrDefault(patientId, BASELINE.clone());
        double[] next = {
                jitter(last[0], 6),                  // heartRate
                Math.min(100, jitter(last[1], 1.2)),  // spo2
                jitter(last[2], 5),                   // systolic
                jitter(last[3], 4),                   // diastolic
                jitter(last[4], 0.3),                 // temp
        };
        lastReadingByPatient.put(patientId, next);

        VitalsReading reading = new VitalsReading(
                patientId,
                Math.round(next[0]),
                Math.round(next[1]),
                Math.round(next[2]),
                Math.round(next[3]),
                Math.round(next[4] * 10.0) / 10.0,
                Instant.now().toString()
        );

        // Key by patientId so all of one patient's readings land on the same partition
        // (preserves per-patient ordering if you ever scale to multiple partitions/consumers).
        kafkaTemplate.send(vitalsTopic, patientId, reading)
                .exceptionally(ex -> {
                    log.warn("Failed to publish vitals reading for patient {} (is Kafka running?): {}",
                            patientId, ex.getMessage());
                    return null;
                });
    }

    private double jitter(double value, double range) {
        return value + (Math.random() - 0.5) * range;
    }
}
