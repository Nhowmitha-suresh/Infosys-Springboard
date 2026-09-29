package com.medisphere.backend.config;

import com.medisphere.backend.dto.VitalsReading;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

/**
 * A concretely-typed KafkaTemplate<String, VitalsReading> bean.
 * (Spun up explicitly, rather than relying on Boot's generic
 * autoconfigured KafkaTemplate<Object,Object>, so DI resolves cleanly
 * for the VitalsReading-typed field in VitalsStreamProducer.)
 */
@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, VitalsReading> vitalsProducerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, VitalsReading> kafkaTemplate(ProducerFactory<String, VitalsReading> vitalsProducerFactory) {
        return new KafkaTemplate<>(vitalsProducerFactory);
    }
}
