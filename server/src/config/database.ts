import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import processEnvConfig from './processEnv.config';

dotenv.config();

const pool = mysql.createPool({
  host: processEnvConfig.DB_HOST,
  user: processEnvConfig.DB_USER,
  password: processEnvConfig.DB_PASSWORD,
  database: processEnvConfig.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
