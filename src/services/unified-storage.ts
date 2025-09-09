/**
 * Unified Storage Service
 * 
 * This service provides a single interface for file storage operations
 * and can switch between Firebase Storage and AWS S3 based on configuration
 */

import { LocalStorageService, clinicalImagesLocalStorage, profileImagesLocalStorage, documentsLocalStorage } from './local-storage';
import { S3StorageService, clinicalImagesS3Storage, profileImagesS3Storage, documentsS3Storage } from './s3-storage';
import { uploadFile as firebaseUploadFile, deleteFile as firebaseDeleteFile, replaceFile as firebaseReplaceFile, clinicalImagesStorage } from './storage';

// Storage configuration
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE !== 'false'; // Default to local storage
const USE_S3_STORAGE = process.env.USE_S3_STORAGE === 'true' && !USE_LOCAL_STORAGE;
const USE_FIREBASE_STORAGE = !USE_LOCAL_STORAGE && !USE_S3_STORAGE;

console.log('Storage configuration:', {
  useLocal: USE_LOCAL_STORAGE,
  useS3: USE_S3_STORAGE,
  useFirebase: USE_FIREBASE_STORAGE,
  s3Configured: S3StorageService.isConfigured()
});

/**
 * Unified Storage Service
 * Switches between Local Storage, AWS S3, and Firebase Storage based on configuration
 */
export class UnifiedStorageService {
  
  /**
   * Upload a file
   */
  static async uploadFile(
    file: File, 
    path: string, 
    fileName?: string
  ): Promise<string> {
    if (USE_LOCAL_STORAGE) {
      return await LocalStorageService.uploadFile(file, path, {});
    } else if (USE_S3_STORAGE) {
      return await S3StorageService.uploadFile(file, path, fileName);
    } else {
      return await firebaseUploadFile(file, path, fileName);
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return await LocalStorageService.deleteFile(fileUrl);
    } else if (USE_S3_STORAGE) {
      return await S3StorageService.deleteFile(fileUrl);
    } else {
      return await firebaseDeleteFile(fileUrl);
    }
  }

  /**
   * Replace an existing file
   */
  static async replaceFile(
    oldFileUrl: string,
    newFile: File,
    path: string,
    fileName?: string
  ): Promise<string> {
    if (USE_LOCAL_STORAGE) {
      return await LocalStorageService.replaceFile(oldFileUrl, newFile, path, {});
    } else if (USE_S3_STORAGE) {
      return await S3StorageService.replaceFile(oldFileUrl, newFile, path, fileName);
    } else {
      return await firebaseReplaceFile(oldFileUrl, newFile, path, fileName);
    }
  }

  /**
   * Get signed URL (S3 only, returns original URL for others)
   */
  static async getSignedUrl(fileUrl: string): Promise<string> {
    if (USE_S3_STORAGE) {
      return await S3StorageService.getSignedUrl(fileUrl);
    } else {
      return fileUrl; // Local and Firebase URLs are already accessible
    }
  }

  /**
   * Check which storage service is being used
   */
  static getStorageType(): 'Local' | 'S3' | 'Firebase' {
    if (USE_LOCAL_STORAGE) return 'Local';
    if (USE_S3_STORAGE) return 'S3';
    return 'Firebase';
  }

  /**
   * Check if storage is properly configured
   */
  static isConfigured(): boolean {
    if (USE_LOCAL_STORAGE) {
      return true; // Local storage is always available
    } else if (USE_S3_STORAGE) {
      return S3StorageService.isConfigured();
    } else {
      return true; // Firebase is always available in this app
    }
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats() {
    if (USE_LOCAL_STORAGE) {
      return await LocalStorageService.getStorageStats();
    } else {
      return {
        totalFiles: 0,
        totalSize: 0,
        totalSizeMB: 0,
        filesByCategory: {},
        storageType: USE_S3_STORAGE ? 'S3' : 'Firebase',
        note: 'Statistics only available for local storage'
      };
    }
  }
}

/**
 * Clinical Images Storage
 * Unified interface for clinical image operations
 */
export const clinicalImagesUnifiedStorage = {
  async uploadClinicalImage(
    file: File, 
    patientId: string, 
    imageType: string
  ): Promise<string> {
    if (USE_LOCAL_STORAGE) {
      return await clinicalImagesLocalStorage.uploadClinicalImage(file, patientId, imageType);
    } else if (USE_S3_STORAGE) {
      return await clinicalImagesS3Storage.uploadClinicalImage(file, patientId, imageType);
    } else {
      return await clinicalImagesStorage.uploadClinicalImage(file, patientId, imageType);
    }
  },

  async replaceClinicalImage(
    oldImageUrl: string,
    newFile: File,
    patientId: string,
    imageType: string
  ): Promise<string> {
    if (USE_LOCAL_STORAGE) {
      return await clinicalImagesLocalStorage.replaceClinicalImage(oldImageUrl, newFile, patientId, imageType);
    } else if (USE_S3_STORAGE) {
      return await clinicalImagesS3Storage.replaceClinicalImage(oldImageUrl, newFile, patientId, imageType);
    } else {
      return await clinicalImagesStorage.replaceClinicalImage(oldImageUrl, newFile, patientId, imageType);
    }
  },

  async deleteClinicalImage(imageUrl: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return await clinicalImagesLocalStorage.deleteClinicalImage(imageUrl);
    } else if (USE_S3_STORAGE) {
      return await clinicalImagesS3Storage.deleteClinicalImage(imageUrl);
    } else {
      return await clinicalImagesStorage.deleteClinicalImage(imageUrl);
    }
  },

  async getSignedImageUrl(imageUrl: string): Promise<string> {
    if (USE_S3_STORAGE) {
      return await clinicalImagesS3Storage.getSignedImageUrl(imageUrl);
    } else {
      return imageUrl; // Local and Firebase URLs are public
    }
  }
};

/**
 * Profile Images Storage
 */
export const profileImagesUnifiedStorage = {
  async uploadProfileImage(file: File, userId: string): Promise<string> {
    if (USE_LOCAL_STORAGE) {
      return await profileImagesLocalStorage.uploadProfileImage(file, userId);
    } else if (USE_S3_STORAGE) {
      return await profileImagesS3Storage.uploadProfileImage(file, userId);
    } else {
      const fileName = `${userId}_profile_${Date.now()}_${file.name}`;
      return await firebaseUploadFile(file, 'profile-images', fileName);
    }
  },

  async replaceProfileImage(oldImageUrl: string, newFile: File, userId: string): Promise<string> {
    if (USE_LOCAL_STORAGE) {
      return await profileImagesLocalStorage.replaceProfileImage(oldImageUrl, newFile, userId);
    } else if (USE_S3_STORAGE) {
      return await profileImagesS3Storage.replaceProfileImage(oldImageUrl, newFile, userId);
    } else {
      const fileName = `${userId}_profile_${Date.now()}_${newFile.name}`;
      return await firebaseReplaceFile(oldImageUrl, newFile, 'profile-images', fileName);
    }
  },

  async deleteProfileImage(imageUrl: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return await profileImagesLocalStorage.deleteProfileImage(imageUrl);
    } else if (USE_S3_STORAGE) {
      return await profileImagesS3Storage.deleteProfileImage(imageUrl);
    } else {
      return await firebaseDeleteFile(imageUrl);
    }
  }
};

/**
 * Documents Storage
 */
export const documentsUnifiedStorage = {
  async uploadDocument(file: File, patientId: string, documentType: string): Promise<string> {
    if (USE_LOCAL_STORAGE) {
      return await documentsLocalStorage.uploadDocument(file, patientId, documentType);
    } else if (USE_S3_STORAGE) {
      return await documentsS3Storage.uploadDocument(file, patientId, documentType);
    } else {
      const fileName = `${patientId}_${documentType}_${Date.now()}_${file.name}`;
      return await firebaseUploadFile(file, 'documents', fileName);
    }
  },

  async replaceDocument(oldDocUrl: string, newFile: File, patientId: string, documentType: string): Promise<string> {
    if (USE_LOCAL_STORAGE) {
      return await documentsLocalStorage.replaceDocument(oldDocUrl, newFile, patientId, documentType);
    } else if (USE_S3_STORAGE) {
      return await documentsS3Storage.replaceDocument(oldDocUrl, newFile, patientId, documentType);
    } else {
      const fileName = `${patientId}_${documentType}_${Date.now()}_${newFile.name}`;
      return await firebaseReplaceFile(oldDocUrl, newFile, 'documents', fileName);
    }
  },

  async deleteDocument(docUrl: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return await documentsLocalStorage.deleteDocument(docUrl);
    } else if (USE_S3_STORAGE) {
      return await documentsS3Storage.deleteDocument(docUrl);
    } else {
      return await firebaseDeleteFile(docUrl);
    }
  },

  async getSignedDocumentUrl(docUrl: string): Promise<string> {
    if (USE_S3_STORAGE) {
      return await documentsS3Storage.getSignedDocumentUrl(docUrl);
    } else {
      return docUrl; // Local and Firebase URLs are public
    }
  }
};

// Export default as the unified service
export default UnifiedStorageService;