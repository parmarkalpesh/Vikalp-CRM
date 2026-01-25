// Fallback to relative path '/api' in production if environment variable is not set
const API_URL = import.meta.env.VITE_API_URL || '/api';

export default API_URL;
