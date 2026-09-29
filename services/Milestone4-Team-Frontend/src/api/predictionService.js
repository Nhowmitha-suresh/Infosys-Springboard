import axiosClient from './axiosClient'

/**
 * Spring Boot contract (PredictionController):
 *   GET    /api/predictions                    -> Prediction[]
 *   GET    /api/predictions/{id}                -> Prediction
 *   GET    /api/predictions/patient/{patientId} -> Prediction[]
 *   POST   /api/predictions/run                 -> Prediction  { patientId }
 *   DELETE /api/predictions/{id}                -> 204
 */
export async function getPredictions() {
  const { data } = await axiosClient.get('/predictions')
  return data
}

export async function getPredictionsForPatient(patientId) {
  const { data } = await axiosClient.get(`/predictions/patient/${patientId}`)
  return data
}

export async function runPrediction(patientId) {
  const { data } = await axiosClient.post('/predictions/run', { patientId })
  return data
}

export async function deletePrediction(id) {
  await axiosClient.delete(`/predictions/${id}`)
  return true
}
