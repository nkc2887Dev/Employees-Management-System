import processEnvConfig from '../config/processEnv.config';

const BASE_URL = processEnvConfig.API_URL.replace(/\/api$/, '');

export const getImageUrl = (photoPath: string | null | undefined): string | null => {
  if (!photoPath) return null;
  if (photoPath.startsWith('http')) {
    return photoPath;
  }

  if (photoPath.startsWith('/')) {
    return `${BASE_URL}${photoPath}`;
  }

  return `${BASE_URL}/uploads/${photoPath}`;
};
