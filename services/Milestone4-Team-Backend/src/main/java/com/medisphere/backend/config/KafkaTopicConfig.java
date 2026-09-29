package com.medisphere.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${app.kafka.vitals-topic}")
    private String vitalsTopic;

    @Value("${app.kafka.vitals-topic-partitions:3}")
    private int partitions;

    /**
     * Auto-creates the "vitals.raw" topic on startup against a local/dev
     * broker (requires auto.create.topics or an AdminClient-capable
     * broker, which the docker-compose Kafka image supports out of the
     * box). Harmless no-op if the topic already exists.
     */
    @Bean
    public NewTopic vitalsTopic() {
        return TopicBuilder.name(vitalsTopic)
                .partitions(partitions)
                .replicas(1)
                .build();
    }
}
