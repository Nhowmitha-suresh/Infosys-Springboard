import React, { useEffect, useRef } from 'react';
import { MediStorage } from '../services/storage';

export const Analytics: React.FC = () => {
  const deptCanvasRef = useRef<HTMLCanvasElement>(null);
  const diseaseCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Render Departmental Distribution Donut/Bar Chart
    if (deptCanvasRef.current) {
      const ctx = deptCanvasRef.current.getContext('2d');
      if (ctx) {
        const width = deptCanvasRef.current.width = deptCanvasRef.current.parentElement?.clientWidth || 500;
        const height = deptCanvasRef.current.height = 240;
        ctx.clearRect(0, 0, width, height);

        const depts = ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics', 'Radiology'];
        const values = [85, 62, 44, 55, 38, 29];
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
        const total = values.reduce((a, b) => a + b, 0);

        let startAngle = 0;
        const centerX = width / 3;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        values.forEach((val, i) => {
          const sliceAngle = (val / total) * 2 * Math.PI;
          ctx.beginPath();
          ctx.fillStyle = colors[i];
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.closePath();
          ctx.fill();

          startAngle += sliceAngle;
        });

        // Donut inner hole
        ctx.beginPath();
        ctx.fillStyle = '#0F172A';
        ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
        ctx.fill();

        // Legend on right
        depts.forEach((dept, i) => {
          const legendX = width / 2 + 40;
          const legendY = 30 + i * 32;

          ctx.fillStyle = colors[i];
          ctx.fillRect(legendX, legendY, 14, 14);

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '12px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`${dept} (${values[i]})`, legendX + 22, legendY + 12);
        });
      }
    }

    // Render Disease Prevalence Bar Chart
    if (diseaseCanvasRef.current) {
      const ctx = diseaseCanvasRef.current.getContext('2d');
      if (ctx) {
        const width = diseaseCanvasRef.current.width = diseaseCanvasRef.current.parentElement?.clientWidth || 500;
        const height = diseaseCanvasRef.current.height = 240;
        ctx.clearRect(0, 0, width, height);

        const diseases = ['Hypertension', 'Diabetes', 'Dengue', 'Asthma', 'IHD', 'CKD'];
        const counts = [120, 95, 45, 38, 28, 18];
        const barWidth = (width - 80) / diseases.length;
        const maxVal = 140;

        diseases.forEach((dis, i) => {
          const barHeight = (counts[i] / maxVal) * (height - 50);
          const x = 50 + i * barWidth;
          const y = height - 30 - barHeight;

          ctx.fillStyle = '#10B981';
          ctx.fillRect(x + 6, y, barWidth - 12, barHeight);

          ctx.fillStyle = '#9CA3AF';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(dis, x + barWidth / 2, height - 10);
        });
      }
    }
  }, []);

  return (
    <div className="page-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Advanced Health Analytics</h1>
        <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          Population Health Intelligence, Departmental Load & Disease Pattern Metrics
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card-panel">
          <h3 style={{ color: '#FFF', marginBottom: '16px' }}>Departmental Patient Load Distribution</h3>
          <canvas ref={deptCanvasRef} style={{ width: '100%', height: '240px', background: '#0F172A', borderRadius: '8px' }} />
        </div>

        <div className="card-panel">
          <h3 style={{ color: '#FFF', marginBottom: '16px' }}>Common Conditions & Disease Prevalence</h3>
          <canvas ref={diseaseCanvasRef} style={{ width: '100%', height: '240px', background: '#0F172A', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
};
