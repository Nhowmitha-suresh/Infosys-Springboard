import { ML_API_URL, serviceRequest } from './serviceClients';

/**
 * Client for the Flask ML microservice (services/ml-service) — Model Versioning
 * endpoints backed by the `model_versions` table.
 */
export type ModelStatus = 'Active' | 'Archived' | 'Inactive' | string;

export interface ModelVersion {
  version_id: number;
  model_name: string;
  version_number: string;
  algorithm: string | null;
  dataset_name: string | null;
  accuracy: number | null;
  precision_score: number | null;
  recall_score: number | null;
  f1_score: number | null;
  training_date: string | null;
  model_path: string | null;
  status: ModelStatus;
}

export interface NewModelVersion {
  model_name: string;
  version_number: string;
  algorithm: string;
  dataset_name: string;
  accuracy: number;
  precision_score: number;
  recall_score: number;
  f1_score: number;
  model_path: string;
}

const SERVICE = 'ML service (Flask model registry)';
const call = <T,>(path: string, method: 'GET' | 'POST' | 'PUT' = 'GET', body?: unknown) =>
  serviceRequest<T>(ML_API_URL, path, { method, body, serviceName: SERVICE });

export const mlService = {
  listModels: () => call<ModelVersion[]>('/models'),
  registerModel: (payload: NewModelVersion) => call<ModelVersion>('/models', 'POST', payload),
  activateModel: (versionId: number) => call<ModelVersion>(`/models/${versionId}/activate`, 'PUT'),
  archiveModel: (versionId: number) => call<ModelVersion>(`/models/${versionId}/archive`, 'PUT'),
};
