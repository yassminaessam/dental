// LEGACY STORAGE SHIM
// This file originally wrapped Firebase Storage. The application has migrated to Neon + external asset storage.
// New uploads should use the API route `/api/uploads` (FTPS/S3 abstraction) instead of calling these functions directly.
// These implementations now only provide mock behavior to avoid runtime errors while legacy callers are refactored.

// Check if we should use Neon database (which means no Firebase Storage)
const USE_NEON_DATABASE = process.env.USE_NEON_DATABASE === 'true';
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// When using Neon database, we use mock storage or alternative cloud storage
const USE_MOCK_UPLOAD = USE_NEON_DATABASE || true;

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

// Upload a file - uses mock upload when using Neon database
export async function uploadFile(
  file: File, 
  path: string, 
  fileName?: string
): Promise<string> {
  console.log('Storage upload started:', { 
    fileName: file.name, 
    size: file.size, 
    type: file.type, 
    path,
    useMock: USE_MOCK_UPLOAD
  });
  
  // When using Neon database, always use mock uploads
  if (USE_MOCK_UPLOAD) {
    return await mockUpload(file, path, fileName);
  }
  
  // This path should not be reached when USE_NEON_DATABASE is true
  throw new Error('Firebase Storage not available when using Neon database');
}

// Delete a file - when using Neon, just logs the action
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Check if this is a mock URL or external URL
    if (fileUrl.includes('mock-token-') || !fileUrl.includes('firebasestorage.googleapis.com')) {
      console.log('Skipping deletion of mock/external URL:', fileUrl);
      return;
    }
    
    if (USE_NEON_DATABASE) {
      console.log('Mock deletion of file (Neon database mode):', fileUrl);
      return;
    }
    
    throw new Error('Firebase Storage not available when using Neon database');
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw error for deletions in Neon mode
    if (USE_NEON_DATABASE) {
      console.log('Ignoring file deletion error in Neon mode');
      return;
    }
    throw new Error('Failed to delete file');
  }
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

// List all files in a directory - returns empty array when using Neon
export async function listFiles(path: string): Promise<any[]> {
  if (USE_NEON_DATABASE) {
    console.log('Mock file listing (Neon database mode) for path:', path);
    return [];
  }
  
  throw new Error('Firebase Storage not available when using Neon database');
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
    // Only delete if it's a Firebase Storage URL
    if (imageUrl.includes('firebasestorage.googleapis.com') || imageUrl.includes('storage.googleapis.com')) {
      return await deleteFile(imageUrl);
    } else {
      console.warn('Skipping deletion of external URL:', imageUrl);
      return Promise.resolve();
    }
  },

  // List all clinical images
  async listClinicalImages(): Promise<any[]> {
    return await listFiles('clinical-images');
  }
};
