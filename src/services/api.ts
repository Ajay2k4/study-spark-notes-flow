
import axios from 'axios';

// Create an axios instance with base URL and default headers
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout for speech generation
});

// Request interceptor to add auth token to each request
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
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
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
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
      try {
        const { access_token } = JSON.parse(user);
        if (access_token === "demo_token_12345") {
          console.log("Demo mode - bypassing API error");
          // For demo mode, we'll return mock successful responses
          
          // Special case for podcasts endpoint in demo mode
          if (error.config && error.config.url && error.config.url.includes('/podcasts')) {
            if (error.config.method === 'post') {
              // Mock podcast creation response
              return Promise.resolve({
                data: {
                  _id: "demo_podcast_" + Date.now(),
                  user_id: "demo_user",
                  title: error.config.data ? JSON.parse(error.config.data).title : "Demo Podcast",
                  content: error.config.data ? JSON.parse(error.config.data).content : "This is a demo podcast content.",
                  audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                  duration: 120.5,
                  voice_id: error.config.data ? JSON.parse(error.config.data).voice_id : "default",
                  tags: error.config.data ? JSON.parse(error.config.data).tags : [],
                  created_at: new Date().toISOString()
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: error.config,
              });
            } else if (error.config.method === 'get' && error.config.url.includes('/voices')) {
              // Mock voices response
              return Promise.resolve({
                data: [
                  { id: "default", name: "Default", gender: "neutral", preview_url: null },
                  { id: "male1", name: "Male Voice", gender: "male", preview_url: null },
                  { id: "female1", name: "Female Voice", gender: "female", preview_url: null }
                ],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: error.config,
              });
            } else if (error.config.method === 'get') {
              // Mock get podcasts response
              return Promise.resolve({
                data: [
                  {
                    _id: "demo_podcast_1",
                    user_id: "demo_user",
                    title: "Demo Podcast 1",
                    content: "This is the first demo podcast content.",
                    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    duration: 120.5,
                    voice_id: "default",
                    tags: ["demo", "example"],
                    created_at: new Date().toISOString()
                  },
                  {
                    _id: "demo_podcast_2",
                    user_id: "demo_user",
                    title: "Demo Podcast 2",
                    content: "This is the second demo podcast content.",
                    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                    duration: 90.2,
                    voice_id: "female1",
                    tags: ["demo"],
                    created_at: new Date(Date.now() - 86400000).toISOString()
                  }
                ],
                status: 200,
                statusText: 'OK',
                headers: {},
                config: error.config,
              });
            }
          }
          
          // Default mock response for other endpoints
          return Promise.resolve({ 
            data: { success: true, message: "Demo mode response" },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config,
          });
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
    
    if (error.response && error.response.status === 401) {
      // Handle 401 errors (unauthorized) - but don't redirect in demo mode
      console.error("Unauthorized access attempt");
      // We won't automatically log out or redirect the user
    }
    return Promise.reject(error);
  }
);

export default api;
