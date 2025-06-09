const processEnvConfig = {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_NAME: process.env.DB_NAME || 'employee_management',
  PORT: process.env.PORT || '9876',
};

export default processEnvConfig;
