package com.medisphere.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * The message published to the "vitals.raw" Kafka topic, and the same
 * shape forwarded to the frontend over WS /ws/vitals/{patientId}.
 *
 * Today {@link com.medisphere.backend.service.VitalsStreamProducer}
 * publishes simulated readings here. Once real bedside monitors /
 * wearables are wired up (via an MQTT bridge, HL7 gateway, etc.),
 * whatever ingests them just needs to publish this same shape to the
 * same topic — the consumer and WebSocket layer don't change.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VitalsReading {
    private String patientId;
    private long heartRate;
    private long spo2;
    private long systolic;
    private long diastolic;
    private double temp;
    private String ts; // ISO-8601 instant
}
