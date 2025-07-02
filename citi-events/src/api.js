// Axios wrapper to call API Gateway
// src/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Upload a new event (used by UploadForm)
export const uploadEvent = (formData) => {
  return axios.post(`${API_BASE_URL}/upload-poster`, formData);
};

// Get all events (used by EventsPage)
export const getEvents = () => {
  return axios.get(`${API_BASE_URL}/events`);
};


