import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const api = {
  startProcess: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await axios.post(`${API_URL}/api/start-check`, formData);
    return response.data;
  },
  
  stopProcess: async (sessionId) => {
    const response = await axios.post(`${API_URL}/api/stop-check`, { sessionId });
    return response.data;
  }
};