-- Seed data mirroring src/data/mockData.js and src/data/patient360Data.js
-- so the app behaves the same once VITE_USE_MOCK_DATA=false is flipped.
-- Safe to re-run: every insert is guarded by a NOT EXISTS check.
--
-- Demo login passwords (bcrypt-hashed below): admin123 / doctor123 / patient123 / reception123

INSERT INTO users (id, name, email, password, role, specialization)
SELECT * FROM (SELECT 1 AS id, 'Ava Thompson' AS name, 'admin@medisphere.com' AS email,
       '$2b$10$FFg1y8CK/B9Y6XAtbICmYO3GvUqlVfcvZ7Z6s3yXsnxSpK5mTOV3S' AS password, 'ADMIN' AS role, NULL AS specialization) t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@medisphere.com');

INSERT INTO users (id, name, email, password, role, specialization)
SELECT * FROM (SELECT 2, 'Dr. Rajesh Menon', 'doctor@medisphere.com',
       '$2b$10$DdPzPH0vE2HRYNaqxRcEheK3p75zOV3orJykiVfLCRegRwEd3qf2e', 'DOCTOR', 'Cardiology') t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'doctor@medisphere.com');

INSERT INTO users (id, name, email, password, role, specialization)
SELECT * FROM (SELECT 3, 'Priya Sharma', 'patient@medisphere.com',
       '$2b$10$zJfoCJug.imD3eXk62GJvuRSVh3T9OsnZ1kLPrOamOyEI0B13FcZu', 'PATIENT', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'patient@medisphere.com');

INSERT INTO users (id, name, email, password, role, specialization)
SELECT * FROM (SELECT 4, 'Meera Nair', 'reception@medisphere.com',
       '$2b$10$0vKxIm1LTdWoZDt0yqeXbuA7XBI3Zbkh4kgdKIQmSX5.S.evAZlpS', 'RECEPTIONIST', NULL) t
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'reception@medisphere.com');

-- Patients
INSERT INTO patients (id, name, age, gender, phone, blood_group, condition, last_visit, doctor, status)
SELECT * FROM (SELECT 101, 'Priya Sharma', 29, 'Female', '+91 98765 43210', 'O+', 'Hypertension', DATE'2026-07-12', 'Dr. Rajesh Menon', 'Active') t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 101);

INSERT INTO patients (id, name, age, gender, phone, blood_group, condition, last_visit, doctor, status)
SELECT * FROM (SELECT 102, 'Arjun Verma', 45, 'Male', '+91 91234 56780', 'B+', 'Type 2 Diabetes', DATE'2026-07-18', 'Dr. Rajesh Menon', 'Active') t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 102);

INSERT INTO patients (id, name, age, gender, phone, blood_group, condition, last_visit, doctor, status)
SELECT * FROM (SELECT 103, 'Kavita Iyer', 34, 'Female', '+91 99887 66554', 'A-', 'Post-surgery follow-up', DATE'2026-06-30', 'Dr. Sana Kapoor', 'Discharged') t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 103);

INSERT INTO patients (id, name, age, gender, phone, blood_group, condition, last_visit, doctor, status)
SELECT * FROM (SELECT 104, 'Rohan Das', 8, 'Male', '+91 90000 11223', 'AB+', 'Seasonal allergy', DATE'2026-07-22', 'Dr. Sana Kapoor', 'Active') t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 104);

INSERT INTO patients (id, name, age, gender, phone, blood_group, condition, last_visit, doctor, status)
SELECT * FROM (SELECT 105, 'Neha Joshi', 61, 'Female', '+91 98123 45670', 'O-', 'Arthritis', DATE'2026-07-05', 'Dr. Rajesh Menon', 'Active') t
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE id = 105);

-- Appointments
INSERT INTO appointments (id, patient_id, patient_name, doctor, date, time, type, status)
SELECT * FROM (SELECT 201, 101, 'Priya Sharma', 'Dr. Rajesh Menon', DATE'2026-07-31', '09:30', 'Follow-up', 'Confirmed') t
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 201);

INSERT INTO appointments (id, patient_id, patient_name, doctor, date, time, type, status)
SELECT * FROM (SELECT 202, 102, 'Arjun Verma', 'Dr. Rajesh Menon', DATE'2026-07-31', '10:15', 'Consultation', 'Pending') t
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 202);

INSERT INTO appointments (id, patient_id, patient_name, doctor, date, time, type, status)
SELECT * FROM (SELECT 203, 104, 'Rohan Das', 'Dr. Sana Kapoor', DATE'2026-07-31', '11:00', 'Check-up', 'Confirmed') t
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 203);

INSERT INTO appointments (id, patient_id, patient_name, doctor, date, time, type, status)
SELECT * FROM (SELECT 204, 105, 'Neha Joshi', 'Dr. Rajesh Menon', DATE'2026-08-01', '09:00', 'Follow-up', 'Confirmed') t
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 204);

INSERT INTO appointments (id, patient_id, patient_name, doctor, date, time, type, status)
SELECT * FROM (SELECT 205, 103, 'Kavita Iyer', 'Dr. Sana Kapoor', DATE'2026-08-01', '14:30', 'Review', 'Cancelled') t
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE id = 205);

-- Allergies
INSERT INTO allergies (patient_id, name) SELECT 101, 'Penicillin' WHERE NOT EXISTS (SELECT 1 FROM allergies WHERE patient_id = 101 AND name = 'Penicillin');
INSERT INTO allergies (patient_id, name) SELECT 101, 'Peanuts' WHERE NOT EXISTS (SELECT 1 FROM allergies WHERE patient_id = 101 AND name = 'Peanuts');
INSERT INTO allergies (patient_id, name) SELECT 103, 'Sulfa drugs' WHERE NOT EXISTS (SELECT 1 FROM allergies WHERE patient_id = 103 AND name = 'Sulfa drugs');
INSERT INTO allergies (patient_id, name) SELECT 104, 'Pollen (seasonal)' WHERE NOT EXISTS (SELECT 1 FROM allergies WHERE patient_id = 104 AND name = 'Pollen (seasonal)');

-- Prescriptions
INSERT INTO prescriptions (patient_id, drug, dosage, prescribed_by, date)
SELECT 101, 'Amlodipine 5mg', 'Once daily', 'Dr. Rajesh Menon', DATE'2026-07-12'
WHERE NOT EXISTS (SELECT 1 FROM prescriptions WHERE patient_id = 101 AND drug = 'Amlodipine 5mg');

INSERT INTO prescriptions (patient_id, drug, dosage, prescribed_by, date)
SELECT 101, 'Aspirin 75mg', 'Once daily, after food', 'Dr. Rajesh Menon', DATE'2026-07-12'
WHERE NOT EXISTS (SELECT 1 FROM prescriptions WHERE patient_id = 101 AND drug = 'Aspirin 75mg');

INSERT INTO prescriptions (patient_id, drug, dosage, prescribed_by, date)
SELECT 102, 'Metformin 500mg', 'Twice daily', 'Dr. Rajesh Menon', DATE'2026-07-18'
WHERE NOT EXISTS (SELECT 1 FROM prescriptions WHERE patient_id = 102 AND drug = 'Metformin 500mg');

INSERT INTO prescriptions (patient_id, drug, dosage, prescribed_by, date)
SELECT 104, 'Cetirizine 10mg', 'Once daily as needed', 'Dr. Sana Kapoor', DATE'2026-07-22'
WHERE NOT EXISTS (SELECT 1 FROM prescriptions WHERE patient_id = 104 AND drug = 'Cetirizine 10mg');

INSERT INTO prescriptions (patient_id, drug, dosage, prescribed_by, date)
SELECT 105, 'Ibuprofen 200mg', 'Twice daily with food', 'Dr. Rajesh Menon', DATE'2026-07-05'
WHERE NOT EXISTS (SELECT 1 FROM prescriptions WHERE patient_id = 105 AND drug = 'Ibuprofen 200mg');

-- Consents (per-patient) — seeded for patient 101 (Priya Sharma) to match consentService.js mock
INSERT INTO consents (patient_id, label, description, granted, required)
SELECT 101, 'Share records with treating doctor', 'Allows your doctor to view your full medical history during consultations.', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM consents WHERE patient_id = 101 AND label = 'Share records with treating doctor');

INSERT INTO consents (patient_id, label, description, granted, required)
SELECT 101, 'Share data with insurance provider', 'Allows billing and insurance claims to access relevant treatment records.', TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM consents WHERE patient_id = 101 AND label = 'Share data with insurance provider');

INSERT INTO consents (patient_id, label, description, granted, required)
SELECT 101, 'Use of data for research (anonymized)', 'Your anonymized data may be used in medical research studies.', FALSE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM consents WHERE patient_id = 101 AND label = 'Use of data for research (anonymized)');

INSERT INTO consents (patient_id, label, description, granted, required)
SELECT 101, 'Telemedicine consultation recording', 'Allows recording of video consultations for quality and reference.', FALSE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM consents WHERE patient_id = 101 AND label = 'Telemedicine consultation recording');

INSERT INTO consents (patient_id, label, description, granted, required)
SELECT 101, 'SMS / email health reminders', 'Allows the platform to send appointment and medication reminders.', TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM consents WHERE patient_id = 101 AND label = 'SMS / email health reminders');

-- Vitals — a starting baseline reading for patient 101 so history isn't empty
-- before the live WebSocket feed (see VitalsWebSocketHandler) writes more.
INSERT INTO vitals (patient_id, heart_rate, spo2, systolic_bp, diastolic_bp, temperature, recorded_at)
SELECT 101, 72, 98, 120, 80, 36.8, TIMESTAMP'2026-08-06 19:09:03'
WHERE NOT EXISTS (SELECT 1 FROM vitals WHERE patient_id = 101 AND recorded_at = TIMESTAMP'2026-08-06 19:09:03');

-- Digital Twins — one per seeded patient, mirrors what TwinService.provision() creates on first access.
INSERT INTO twins (id, patient_id, fhir_sync_status, fhir_resource_count, last_synced_at, created_at)
SELECT * FROM (SELECT 401, 101, 'Synced', 12, TIMESTAMP'2026-08-06 19:09:03', TIMESTAMP'2026-06-02 09:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM twins WHERE id = 401);

INSERT INTO twins (id, patient_id, fhir_sync_status, fhir_resource_count, last_synced_at, created_at)
SELECT * FROM (SELECT 402, 102, 'Synced', 8, TIMESTAMP'2026-07-18 10:00:00', TIMESTAMP'2026-06-05 09:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM twins WHERE id = 402);

INSERT INTO twins (id, patient_id, fhir_sync_status, fhir_resource_count, last_synced_at, created_at)
SELECT * FROM (SELECT 403, 105, 'Synced', 6, TIMESTAMP'2026-07-05 09:30:00', TIMESTAMP'2026-06-10 09:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM twins WHERE id = 403);

-- Predictions — sample risk-model runs, matching PredictionService's heuristic output shape.
INSERT INTO predictions (id, patient_id, risk_type, risk_percent, risk_level, factors, model_version, created_at)
SELECT * FROM (SELECT 501, 101, '12-month adverse cardiac event risk', 18.5, 'Moderate',
       'Hypertension, Elevated systolic BP (138 mmHg)', 'heuristic-v1', TIMESTAMP'2026-07-30 08:15:00') t
WHERE NOT EXISTS (SELECT 1 FROM predictions WHERE id = 501);

INSERT INTO predictions (id, patient_id, risk_type, risk_percent, risk_level, factors, model_version, created_at)
SELECT * FROM (SELECT 502, 102, '12-month adverse cardiac event risk', 42.0, 'High',
       'Diabetes, Age >= 45, Elevated systolic BP (150 mmHg)', 'heuristic-v1', TIMESTAMP'2026-07-18 11:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM predictions WHERE id = 502);

-- Alerts — one open, one already acknowledged.
INSERT INTO alerts (id, patient_id, patient_name, severity, title, message, source, acknowledged, created_at)
SELECT * FROM (SELECT 601, 102, 'Arjun Verma', 'Warning', 'High-risk prediction generated',
       'Predicted 42.0% 12-month adverse cardiac event risk. Factors: Diabetes, Age >= 45, Elevated systolic BP (150 mmHg)',
       'Prediction', FALSE, TIMESTAMP'2026-07-18 11:00:05') t
WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE id = 601);

INSERT INTO alerts (id, patient_id, patient_name, severity, title, message, source, acknowledged, acknowledged_by, acknowledged_at, created_at)
SELECT * FROM (SELECT 602, 101, 'Priya Sharma', 'Warning', 'Abnormal vitals detected',
       'Systolic BP 145 mmHg elevated.', 'Vitals', TRUE, 'Dr. Rajesh Menon', TIMESTAMP'2026-07-30 09:00:00', TIMESTAMP'2026-07-30 08:45:00') t
WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE id = 602);

-- Care plans
INSERT INTO careplans (id, patient_id, patient_name, title, assigned_doctor, notes, follow_up_date, status, created_at)
SELECT * FROM (SELECT 701, 101, 'Priya Sharma', 'Hypertension management plan', 'Dr. Rajesh Menon',
       'Follow-up in 4 weeks, lipid panel recheck in 8 weeks.', DATE'2026-08-27', 'Active', TIMESTAMP'2026-07-12 10:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM careplans WHERE id = 701);

INSERT INTO careplans (id, patient_id, patient_name, title, assigned_doctor, notes, follow_up_date, status, created_at)
SELECT * FROM (SELECT 702, 102, 'Arjun Verma', 'Diabetes control plan', 'Dr. Rajesh Menon',
       'HbA1c recheck in 6 weeks, dietician referral.', DATE'2026-08-29', 'Active', TIMESTAMP'2026-07-18 12:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM careplans WHERE id = 702);

-- Reports
INSERT INTO reports (id, patient_id, patient_name, type, title, content, generated_by, generated_at)
SELECT * FROM (SELECT 801, 101, 'Priya Sharma', 'Summary', 'Priya Sharma — Summary Report',
       'Patient: Priya Sharma | Age: 29 | Gender: Female | Condition: Hypertension', 'Dr. Rajesh Menon', TIMESTAMP'2026-07-30 09:15:00') t
WHERE NOT EXISTS (SELECT 1 FROM reports WHERE id = 801);

-- ============================================================================
-- Milestone 4 — Precision Care Management
-- Seeded for patient 102 (Arjun Verma, Type 2 Diabetes) so the Precision
-- Care dashboard has real data out of the box. All pc_* tables are created
-- automatically by Hibernate (ddl-auto=update); every value below mirrors
-- what was previously hardcoded in the milestone-4 frontend mockup, now
-- served from the database instead.
-- ============================================================================

INSERT INTO pc_care_plans (id, patient_id, diagnosis_summary, plan_version, status, predicted_cvd_risk, adherence_score, hospitalization_risk_reduction, prediction_confidence, created_at, updated_at)
SELECT * FROM (SELECT 901, 102, 'Type 2 Diabetes + Hypertension', 'v2.1', 'Clinician review ready', 16.2, 87, 23, 94.2,
       TIMESTAMP'2026-07-18 12:00:00', TIMESTAMP'2026-07-18 12:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_plans WHERE id = 901);

INSERT INTO pc_care_plan_goals (id, care_plan_id, goal_number, label, title, intervention, monitoring, state)
SELECT * FROM (SELECT 911, 901, 1, 'GLYCEMIC CONTROL', 'Reduce HbA1c to <7.0% in 3 months',
       'Increase Metformin to 1000mg BID', 'Weekly glucose logs via patient app', 'On track') t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_plan_goals WHERE id = 911);

INSERT INTO pc_care_plan_goals (id, care_plan_id, goal_number, label, title, intervention, monitoring, state)
SELECT * FROM (SELECT 912, 901, 2, 'BLOOD PRESSURE', 'Reach BP target <130/80 mmHg',
       'Add Amlodipine 5mg', 'Daily BP from connected wearable', 'Improving') t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_plan_goals WHERE id = 912);

INSERT INTO pc_outcome_metrics (id, patient_id, label, current_value, target_value, baseline_value, change_text, progress_percent, status, icon, tone, display_order)
SELECT * FROM (SELECT 921, 102, 'HbA1c', '7.4%', '< 7.0%', '8.2%', '−0.8%', 78, 'Improving', 'bi-droplet-half', 'blue', 1) t
WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_metrics WHERE id = 921);

INSERT INTO pc_outcome_metrics (id, patient_id, label, current_value, target_value, baseline_value, change_text, progress_percent, status, icon, tone, display_order)
SELECT * FROM (SELECT 922, 102, 'Blood Pressure', '132/84', '< 130/80', '140/89', '−8/5 mmHg', 72, 'Improving', 'bi-heart-pulse', 'purple', 2) t
WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_metrics WHERE id = 922);

INSERT INTO pc_outcome_metrics (id, patient_id, label, current_value, target_value, baseline_value, change_text, progress_percent, status, icon, tone, display_order)
SELECT * FROM (SELECT 923, 102, 'CVD Risk', '16.2%', '< 15%', '21.8%', '−5.6 pts', 84, 'Trending down', 'bi-activity', 'green', 3) t
WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_metrics WHERE id = 923);

INSERT INTO pc_outcome_metrics (id, patient_id, label, current_value, target_value, baseline_value, change_text, progress_percent, status, icon, tone, display_order)
SELECT * FROM (SELECT 924, 102, 'Adherence', '87%', '> 85%', '75%', '+12 pts', 87, 'Above target', 'bi-check2-circle', 'cyan', 4) t
WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_metrics WHERE id = 924);

INSERT INTO pc_outcome_trend_points (id, patient_id, metric_key, sequence, day_label, value)
SELECT * FROM (SELECT 931, 102, 'cvd_risk', 1, 'Day 0', 21.8) t WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_trend_points WHERE id = 931);
INSERT INTO pc_outcome_trend_points (id, patient_id, metric_key, sequence, day_label, value)
SELECT * FROM (SELECT 932, 102, 'cvd_risk', 2, 'Day 15', 20.4) t WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_trend_points WHERE id = 932);
INSERT INTO pc_outcome_trend_points (id, patient_id, metric_key, sequence, day_label, value)
SELECT * FROM (SELECT 933, 102, 'cvd_risk', 3, 'Day 30', 19.1) t WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_trend_points WHERE id = 933);
INSERT INTO pc_outcome_trend_points (id, patient_id, metric_key, sequence, day_label, value)
SELECT * FROM (SELECT 934, 102, 'cvd_risk', 4, 'Day 45', 18.3) t WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_trend_points WHERE id = 934);
INSERT INTO pc_outcome_trend_points (id, patient_id, metric_key, sequence, day_label, value)
SELECT * FROM (SELECT 935, 102, 'cvd_risk', 5, 'Day 60', 17.4) t WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_trend_points WHERE id = 935);
INSERT INTO pc_outcome_trend_points (id, patient_id, metric_key, sequence, day_label, value)
SELECT * FROM (SELECT 936, 102, 'cvd_risk', 6, 'Day 75', 16.8) t WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_trend_points WHERE id = 936);
INSERT INTO pc_outcome_trend_points (id, patient_id, metric_key, sequence, day_label, value)
SELECT * FROM (SELECT 937, 102, 'cvd_risk', 7, 'Day 90', 16.2) t WHERE NOT EXISTS (SELECT 1 FROM pc_outcome_trend_points WHERE id = 937);

INSERT INTO pc_care_milestones (id, patient_id, title, detail, state, status_label, display_order)
SELECT * FROM (SELECT 941, 102, 'Medication optimization', 'Metformin adjustment completed', 'complete', 'Complete', 1) t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_milestones WHERE id = 941);
INSERT INTO pc_care_milestones (id, patient_id, title, detail, state, status_label, display_order)
SELECT * FROM (SELECT 942, 102, 'Daily BP monitoring', '92% wearable sync adherence', 'complete', 'On track', 2) t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_milestones WHERE id = 942);
INSERT INTO pc_care_milestones (id, patient_id, title, detail, state, status_label, display_order)
SELECT * FROM (SELECT 943, 102, 'HbA1c target', '7.4% current · target <7.0%', 'active', 'In progress', 3) t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_milestones WHERE id = 943);
INSERT INTO pc_care_milestones (id, patient_id, title, detail, state, status_label, display_order)
SELECT * FROM (SELECT 944, 102, 'CVD risk <15%', 'Projected 14.9% at next review', 'pending', 'Projected', 4) t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_milestones WHERE id = 944);

INSERT INTO pc_clinical_guidelines (id, patient_id, code, icon, guideline_name, requirement, status, detail, score, updated_label)
SELECT * FROM (SELECT 951, 102, 'ADA', 'bi-droplet-half', 'ADA Standards of Care — Diabetes', 'HbA1c target <7.0% for most adults', 'compliant', 'Current plan targets 7.0% within 3 months', '100%', 'Updated today') t
WHERE NOT EXISTS (SELECT 1 FROM pc_clinical_guidelines WHERE id = 951);
INSERT INTO pc_clinical_guidelines (id, patient_id, code, icon, guideline_name, requirement, status, detail, score, updated_label)
SELECT * FROM (SELECT 952, 102, 'ACC', 'bi-heart-pulse', 'ACC/AHA Hypertension Guidelines', 'BP target <130/80 mmHg for high-risk patients', 'compliant', 'Amlodipine 5mg added per Step 2 protocol', '100%', 'Updated today') t
WHERE NOT EXISTS (SELECT 1 FROM pc_clinical_guidelines WHERE id = 952);
INSERT INTO pc_clinical_guidelines (id, patient_id, code, icon, guideline_name, requirement, status, detail, score, updated_label)
SELECT * FROM (SELECT 953, 102, 'CMS', 'bi-capsule-pill', 'CMS Quality Measures — Medication Adherence', 'PDC ≥80% for chronic medications', 'compliant', 'Current PDC: 87% (Metformin + Amlodipine)', '100%', 'Updated 1 hr ago') t
WHERE NOT EXISTS (SELECT 1 FROM pc_clinical_guidelines WHERE id = 953);
INSERT INTO pc_clinical_guidelines (id, patient_id, code, icon, guideline_name, requirement, status, detail, score, updated_label)
SELECT * FROM (SELECT 954, 102, 'USP', 'bi-activity', 'USPSTF — Cardiovascular Screening', 'Annual CVD risk assessment for diabetics', 'review', 'Next assessment due in 45 days', '72%', 'Review required') t
WHERE NOT EXISTS (SELECT 1 FROM pc_clinical_guidelines WHERE id = 954);
INSERT INTO pc_clinical_guidelines (id, patient_id, code, icon, guideline_name, requirement, status, detail, score, updated_label)
SELECT * FROM (SELECT 955, 102, 'JC', 'bi-diagram-3', 'Joint Commission — Care Coordination', 'Documented handoff within 24 hrs of plan change', 'compliant', 'Cardiologist notified · EHR updated', '100%', 'Updated today') t
WHERE NOT EXISTS (SELECT 1 FROM pc_clinical_guidelines WHERE id = 955);

INSERT INTO pc_care_team_members (id, patient_id, name, role, presence_status, last_action, last_action_time, initials)
SELECT * FROM (SELECT 961, 102, 'Dr. Rajesh Menon', 'Primary Care Physician', 'online', 'Approved careplan v2.1', '10 min ago', 'RM') t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_team_members WHERE id = 961);
INSERT INTO pc_care_team_members (id, patient_id, name, role, presence_status, last_action, last_action_time, initials)
SELECT * FROM (SELECT 962, 102, 'Dr. Sana Kapoor', 'Cardiologist', 'online', 'Reviewed CVD risk assessment', '1 hr ago', 'SK') t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_team_members WHERE id = 962);
INSERT INTO pc_care_team_members (id, patient_id, name, role, presence_status, last_action, last_action_time, initials)
SELECT * FROM (SELECT 963, 102, 'Nurse Meera Nair', 'Care Coordinator', 'away', 'Scheduled patient follow-up call', '2 hrs ago', 'MN') t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_team_members WHERE id = 963);
INSERT INTO pc_care_team_members (id, patient_id, name, role, presence_status, last_action, last_action_time, initials)
SELECT * FROM (SELECT 964, 102, 'Pharm. David Park', 'Clinical Pharmacist', 'offline', 'Verified Metformin dosage adjustment', 'Yesterday', 'DP') t
WHERE NOT EXISTS (SELECT 1 FROM pc_care_team_members WHERE id = 964);

INSERT INTO pc_collaboration_messages (id, patient_id, sender_name, sender_role, recipient, message, created_at)
SELECT * FROM (SELECT 971, 102, 'Dr. Rajesh Menon', 'Primary Care Physician', 'Care Team', 'Patient responding well to Metformin increase. Continue weekly glucose monitoring.', TIMESTAMP'2026-07-30 09:50:00') t
WHERE NOT EXISTS (SELECT 1 FROM pc_collaboration_messages WHERE id = 971);
INSERT INTO pc_collaboration_messages (id, patient_id, sender_name, sender_role, recipient, message, created_at)
SELECT * FROM (SELECT 972, 102, 'Nurse Meera Nair', 'Care Coordinator', 'Patient', 'Reminder sent for daily BP wearable sync and app check-in.', TIMESTAMP'2026-07-30 08:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM pc_collaboration_messages WHERE id = 972);
INSERT INTO pc_collaboration_messages (id, patient_id, sender_name, sender_role, recipient, message, created_at)
SELECT * FROM (SELECT 973, 102, 'System', 'Automated', 'Patient Portal', 'Careplan v2.1 shared successfully. Read receipt is pending.', TIMESTAMP'2026-07-29 16:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM pc_collaboration_messages WHERE id = 973);

INSERT INTO pc_collaboration_tasks (id, patient_id, title, assignee, due_label, done, created_at)
SELECT * FROM (SELECT 981, 102, 'Schedule 14-day outcome review', 'Nurse Meera Nair', 'Due today', FALSE, TIMESTAMP'2026-07-30 09:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM pc_collaboration_tasks WHERE id = 981);
INSERT INTO pc_collaboration_tasks (id, patient_id, title, assignee, due_label, done, created_at)
SELECT * FROM (SELECT 982, 102, 'Verify Amlodipine dosage', 'Pharm. David Park', 'Due today', TRUE, TIMESTAMP'2026-07-29 15:00:00') t
WHERE NOT EXISTS (SELECT 1 FROM pc_collaboration_tasks WHERE id = 982);
INSERT INTO pc_collaboration_tasks (id, patient_id, title, assignee, due_label, done, created_at)
SELECT * FROM (SELECT 983, 102, 'Send careplan v2.1 to patient portal', 'Dr. Rajesh Menon', 'Completed', TRUE, TIMESTAMP'2026-07-29 12:10:00') t
WHERE NOT EXISTS (SELECT 1 FROM pc_collaboration_tasks WHERE id = 983);
