import { createConnection, initializeDatabase } from './config/db.config';
import app from './app';
import processEnvConfig from './config/processEnv.config';

(async () => {
  try {
    await initializeDatabase();

    // Test connection
    const connection = await createConnection();
    await connection.end();

    app.listen(processEnvConfig.PORT, () => {
      console.info(`Server is running on port ${processEnvConfig.PORT}`);
    });
  } catch (error: unknown) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
