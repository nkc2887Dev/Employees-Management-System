export const getPhotoUrl = (photoFileName: string | null): string | null => {
  if (!photoFileName) return null;
  return `/uploads/${photoFileName}`;
};
