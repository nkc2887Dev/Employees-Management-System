const processEnvConfig = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:9876/api',
};

export default processEnvConfig;
