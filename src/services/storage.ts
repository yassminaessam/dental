// Local upload through Next.js API (saves to public/clinical-images)

async function apiUpload(file: File, category: string, fileName?: string, extra?: Record<string, string>): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  if (fileName) form.append('fileName', fileName);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) form.append(k, v);
  }
  const res = await fetch('/api/uploads', { method: 'POST', body: form });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Upload failed: ${res.status} ${msg}`);
  }
  const data = await res.json();
  return data.url as string;
}

async function apiDelete(url: string): Promise<void> {
  const res = await fetch(`/api/uploads?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
  if (!res.ok) {
    console.warn('Delete failed', await res.text());
  }
}

export async function uploadFile(file: File, path: string, fileName?: string): Promise<string> {
  return await apiUpload(file, path, fileName);
}

export async function deleteFile(fileUrl: string): Promise<void> {
  await apiDelete(fileUrl);
}

export async function replaceFile(
  oldFileUrl: string,
  newFile: File,
  path: string,
  fileName?: string
): Promise<string> {
  try {
    if (oldFileUrl) {
      await deleteFile(oldFileUrl);
    }
    return await uploadFile(newFile, path, fileName);
  } catch (error) {
    console.error('Error replacing file:', error);
    throw new Error('Failed to replace file');
  }
}

export async function listFiles(_path: string): Promise<string[]> {
  return [];
}

export function getStoragePathFromUrl(url: string): string {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return decodeURIComponent(u.pathname.replace(/^\//, ''));
  } catch (error) {
    console.error('Error parsing storage path:', error);
    return '';
  }
}

export const clinicalImagesStorage = {
  async uploadClinicalImage(
    file: File,
    patientId: string,
    imageType: string
  ): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${patientId}_${imageType}_${timestamp}_${file.name}`;
    return await apiUpload(file, 'clinical-images', fileName, { patientId, imageType });
  },

  async replaceClinicalImage(
    oldImageUrl: string,
    newFile: File,
    patientId: string,
    imageType: string
  ): Promise<string> {
    await apiDelete(oldImageUrl);
    const timestamp = Date.now();
    const fileName = `${patientId}_${imageType}_${timestamp}_${newFile.name}`;
    return await apiUpload(newFile, 'clinical-images', fileName, { patientId, imageType });
  },

  async deleteClinicalImage(imageUrl: string): Promise<void> {
    await apiDelete(imageUrl);
  },

  async listClinicalImages(): Promise<string[]> {
    return [];
  }
};
