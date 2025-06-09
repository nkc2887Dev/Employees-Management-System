import processEnvConfig from '../config/processEnv.config';

// Get the base URL without /api
const BASE_URL = processEnvConfig.API_URL.replace(/\/api$/, '');

export const getImageUrl = (photoPath: string | null | undefined): string | null => {
  if (!photoPath) return null;

  // If it's already a full URL, return as is
  if (photoPath.startsWith('http')) {
    return photoPath;
  }

  // If it's a relative path starting with /, append to base URL
  if (photoPath.startsWith('/')) {
    return `${BASE_URL}${photoPath}`;
  }

  // Otherwise, assume it's a relative path and append to uploads
  return `${BASE_URL}/uploads/${photoPath}`;
};
