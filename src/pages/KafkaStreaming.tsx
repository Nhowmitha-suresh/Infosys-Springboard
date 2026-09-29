import React, { useState } from 'react';
import { MediStorage } from '../services/storage';
import { MediToast } from '../components/Toast';
import { DataTable, Column } from '../components/DataTable';
import { KafkaEvent } from '../types';

export const KafkaStreaming: React.FC = () => {
  const [kafkaEvents] = useState(MediStorage.getKafkaEvents());
  const [isStreaming, setIsStreaming] = useState(true);

  const columns: Column<KafkaEvent>[] = [
    { key: 'id', label: 'Event ID' },
    { key: 'topic', label: 'Topic', render: (v) => <span className="badge badge-primary">{v}</span> },
    { key: 'partition', label: 'Partition', render: (v) => `P-${v}` },
    { key: 'offset', label: 'Offset' },
    { key: 'timestamp', label: 'Timestamp', render: (v) => new Date(v).toLocaleTimeString() },
    { key: 'source', label: 'Source System' },
    { key: 'eventType', label: 'Event Type' },
    {
      key: 'payload',
      label: 'Payload Data',
      render: (v) => <code style={{ fontSize: '0.75rem', color: '#34D399' }}>{v}</code>
    }
  ];

  const toggleStream = () => {
    setIsStreaming(!isStreaming);
    MediToast.info(isStreaming ? 'Kafka Stream paused' : 'Kafka Stream resumed (Topic: vitals.stream.v1)');
  };

  return (
    <div className="page-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Kafka Streaming Data Hub</h1>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Apache Kafka Event Bus - ICU IoT Gateway Telemetry & Real-Time Stream
          </p>
        </div>
        <button className={`btn ${isStreaming ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleStream}>
          {isStreaming ? '⏸️ Pause Stream' : '▶️ Resume Stream'}
        </button>
      </div>

      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-title">Active Topic</div>
          <div className="metric-value" style={{ fontSize: '1.2rem', color: '#60A5FA' }}>vitals.stream.v1</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Total Stream Events</div>
          <div className="metric-value">{kafkaEvents.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-title">Kafka Consumer Lag</div>
          <div className="metric-value" style={{ color: '#10B981' }}>0 ms</div>
        </div>
      </div>

      <div className="card-panel">
        <DataTable
          data={kafkaEvents}
          columns={columns}
          pageSize={10}
          exportFilename="medisphere_kafka_stream.csv"
        />
      </div>
    </div>
  );
};
