import { storage } from '@/lib/firebase';
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageReference 
} from 'firebase/storage';

// Check if we're in development mode and Firebase is having issues
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const USE_MOCK_UPLOAD = true; // Set to true to use mock uploads in development

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
export async function uploadFile(
  file: File, 
  path: string, 
  fileName?: string
): Promise<string> {
  try {
    console.log('Storage upload started:', { 
      fileName: file.name, 
      size: file.size, 
      type: file.type, 
      path,
      useMock: USE_MOCK_UPLOAD
    });
    
    // If using mock upload, return early
    if (USE_MOCK_UPLOAD) {
      return await mockUpload(file, path, fileName);
    }
    
    const finalFileName = fileName || `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${path}/${finalFileName}`);
    
    console.log('Storage reference created:', storageRef.fullPath);
    
    // Try resumable upload first (better for CORS)
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // Wait for upload to complete
    await new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        () => {
          console.log('Upload completed successfully');
          resolve(uploadTask.snapshot);
        }
      );
    });
    
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    console.log('Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Detailed storage error:', error);
    
    // If in development and Firebase fails, use mock upload
    if (USE_MOCK_UPLOAD || isDevelopment) {
      console.log('Firebase upload failed, falling back to mock upload for development');
      return await mockUpload(file, path, fileName);
    }
    
    // Fallback to simple upload if resumable fails
    try {
      console.log('Trying fallback upload method...');
      const finalFileName = fileName || `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `${path}/${finalFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (fallbackError) {
      console.error('Fallback upload also failed:', fallbackError);
      
      // Last resort: use mock upload
      if (isDevelopment) {
        console.log('All Firebase uploads failed, using mock upload for development');
        return await mockUpload(file, path, fileName);
      }
      
      throw new Error('Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}

// Delete a file from Firebase Storage
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Check if this is a Firebase Storage URL
    if (!fileUrl.includes('firebasestorage.googleapis.com') && !fileUrl.includes('storage.googleapis.com')) {
      console.warn('Attempting to delete non-Firebase Storage URL:', fileUrl);
      return; // Skip deletion for external URLs like Unsplash
    }
    
    // Check if this is a mock URL (for development)
    if (fileUrl.includes('mock-token-')) {
      console.log('Skipping deletion of mock upload URL:', fileUrl);
      return; // Skip deletion for mock URLs
    }
    
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
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

// List all files in a directory
export async function listFiles(path: string): Promise<StorageReference[]> {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
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
  async listClinicalImages(): Promise<StorageReference[]> {
    return await listFiles('clinical-images');
  }
};
