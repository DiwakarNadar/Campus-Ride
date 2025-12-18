import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/auth/",
});

// 🔒 Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔒 Response interceptor (FIXED)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❌ If refresh also failed, STOP
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");

      // 🔴 NO REFRESH TOKEN → LOGOUT
      if (!refresh) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          "http://127.0.0.1:8000/auth/token/refresh/",
          { refresh }
        );

        localStorage.setItem("access", res.data.access);
        originalRequest.headers.Authorization =
          `Bearer ${res.data.access}`;

        return api(originalRequest);
      } catch (err) {
        // 🔴 Refresh failed → LOGOUT & STOP LOOP
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
