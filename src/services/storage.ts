// Mock-only storage layer (Firebase removed). For production, consider Vercel Blob.
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const USE_MOCK_UPLOAD = true;

// Mock upload function for development
async function mockUpload(file: File, path: string, fileName?: string): Promise<string> {
  console.log('Using mock upload for development:', { fileName: file.name, size: file.size });
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a mock URL that looks like Firebase Storage
  const mockFileName = fileName || `${Date.now()}_${file.name}`;
  const mockUrl = `https://firebasestorage.googleapis.com/v0/b/dental-a627d.appspot.com/o/${path}%2F${mockFileName}?alt=media&token=mock-token-${Date.now()}`;
  
  console.log('Mock upload completed:', mockUrl);
  return mockUrl;
}

// Upload a file to Firebase Storage with fallback to mock
export async function uploadFile(file: File, path: string, fileName?: string): Promise<string> {
  // Mock only
  return await mockUpload(file, path, fileName);
}

// Delete a file from Firebase Storage
export async function deleteFile(fileUrl: string): Promise<void> {
  // Mock only: nothing to delete
  console.log('Mock delete file:', fileUrl);
}

// Replace an existing file with a new one
export async function replaceFile(
  oldFileUrl: string,
  newFile: File,
  path: string,
  fileName?: string
): Promise<string> {
  try {
    // Delete the old file first (only if it's a Firebase Storage URL)
    if (oldFileUrl && (oldFileUrl.includes('firebasestorage.googleapis.com') || oldFileUrl.includes('storage.googleapis.com'))) {
      try {
        await deleteFile(oldFileUrl);
      } catch (error) {
        console.warn('Warning: Could not delete old file:', error);
      }
    }
    
    // Upload the new file
    const newFileUrl = await uploadFile(newFile, path, fileName);
    return newFileUrl;
  } catch (error) {
    console.error('Error replacing file:', error);
    throw new Error('Failed to replace file');
  }
}

// List all files in a directory
export async function listFiles(_path: string): Promise<string[]> {
  // Mock only: return empty list
  return [];
}

// Get the storage path from a download URL
export function getStoragePathFromUrl(url: string): string {
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];
    return decodeURIComponent(fileName);
  } catch (error) {
    console.error('Error parsing storage path:', error);
    return '';
  }
}

// Clinical Images specific functions
export const clinicalImagesStorage = {
  // Upload clinical image
  async uploadClinicalImage(
    file: File, 
    patientId: string, 
    imageType: string
  ): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${patientId}_${imageType}_${timestamp}_${file.name}`;
    return await uploadFile(file, 'clinical-images', fileName);
  },

  // Replace clinical image
  async replaceClinicalImage(
    oldImageUrl: string,
    newFile: File,
    patientId: string,
    imageType: string
  ): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${patientId}_${imageType}_${timestamp}_${newFile.name}`;
    return await replaceFile(oldImageUrl, newFile, 'clinical-images', fileName);
  },

  // Delete clinical image
  async deleteClinicalImage(imageUrl: string): Promise<void> {
    return await deleteFile(imageUrl);
  },

  // List all clinical images
  async listClinicalImages(): Promise<string[]> {
    return await listFiles('clinical-images');
  }
};
