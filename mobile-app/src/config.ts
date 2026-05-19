/**
 * Global Configuration for CIRO Mobile App
 */

export const CONFIG = {
  // Replace this with your machine's local IP address
  // You can find it by running 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)
  API_BASE_URL: 'http://192.168.100.62:8000/api',
  
  // Demo Mode - Set to true to use mock data if backend is unavailable
  DEMO_MODE: false,
  
  // Refresh interval for active crises (ms)
  REFRESH_INTERVAL: 10000,
};
