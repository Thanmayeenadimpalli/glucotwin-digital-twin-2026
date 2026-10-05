import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = () => api.get('/health');
export const getMetrics = () => api.get('/metrics');
export const getPatients = () => api.get('/patients');
export const getPatientProfile = (id) => api.get(`/patients/${id}`);
export const getDigitalTwinState = (id) => api.get(`/digital-twin/${id}`);
export const getWearableSeries = (id) => api.get(`/wearables/${id}`);
export const getGlucoseSeries = (id) => api.get(`/glucose/${id}`);
export const simulateDigitalTwin = (patientId, simulations) =>
  api.post('/digital-twin/simulate', { patient_id: patientId, simulations });
export const getPredictionHistory = (id) => api.get(`/predictions/${id}`);
export const getExplainability = (id) => api.get(`/explainability/${id}`);
export const getPatientReport = (id) => api.get(`/reports/${id}`);

export default api;
