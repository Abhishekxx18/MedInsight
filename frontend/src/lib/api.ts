import axios from "axios";

const api = axios.create({
  baseURL:
    window.location.host == "localhost:5173"
      ? "http://localhost:5000"
      : window.location.origin,
});
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      config.headers.SessionId = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
