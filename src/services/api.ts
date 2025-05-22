
import axios from 'axios';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to each request
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const { access_token } = JSON.parse(user);
      if (access_token) {
        // For demo token, don't actually send the token to backend
        if (access_token !== "demo_token_12345") {
          config.headers.Authorization = `Bearer ${access_token}`;
        } else {
          // For demo mode, we'll mock successful responses
          console.log("Demo mode active - token not sent to backend");
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and demo mode
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if we're in demo mode
    const user = localStorage.getItem('user');
    if (user) {
      const { access_token } = JSON.parse(user);
      if (access_token === "demo_token_12345") {
        console.log("Demo mode - bypassing API error");
        // For demo mode, we'll return mock successful responses
        return Promise.resolve({ 
          data: { success: true, message: "Demo mode response" },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        });
      }
    }
    
    if (error.response && error.response.status === 401) {
      // Handle 401 errors (unauthorized)
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
