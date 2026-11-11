import axios from 'axios';

const API_BASE = '/api/v1/photos';

export async function checkBackendHealth() {
  try {
    const res = await axios.get(`${API_BASE}/health`, { timeout: 3000 });
    return res.data;
  } catch (error) {
    console.warn('Backend not reachable:', error.message);
    return null;
  }
}

export async function transformPhotosApi(images, style, prompt = '') {
  try {
    const res = await axios.post(`${API_BASE}/transform`, {
      images,
      style,
      prompt,
    });
    return res.data;
  } catch (error) {
    console.error('AI Transform API failed:', error);
    throw error;
  }
}
