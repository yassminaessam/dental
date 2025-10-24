import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'dental-clinic-files';
const USE_S3_STORAGE = process.env.USE_S3_STORAGE === 'true';

// Mock storage for development/testing
class MockStorage {
  private mockFiles: Map<string, { url: string; metadata: any }> = new Map();

  async upload(file: File, key: string): Promise<string> {
    console.log('Mock S3 upload:', { fileName: file.name, key });
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload time
    
    const mockUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}?mock=true&timestamp=${Date.now()}`;
    this.mockFiles.set(key, { 
      url: mockUrl, 
      metadata: { 
        name: file.name, 
        size: file.size, 
        type: file.type,
        uploadedAt: new Date().toISOString()
      }
    });
    
    console.log('Mock S3 upload completed:', mockUrl);
    return mockUrl;
  }

  async delete(key: string): Promise<void> {
    console.log('Mock S3 delete:', key);
    this.mockFiles.delete(key);
  }

  async getSignedUrl(key: string): Promise<string> {
    const file = this.mockFiles.get(key);
    return file?.url || `https://${BUCKET_NAME}.s3.amazonaws.com/${key}?mock=true`;
  }
}

const mockStorage = new MockStorage();

// S3 Storage service
export class S3StorageService {
  
  /**
   * Upload a file to S3
   */
  static async uploadFile(
    file: File, 
    path: string, 
    fileName?: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const finalFileName = fileName || `${timestamp}_${file.name}`;
      const key = `${path}/${finalFileName}`;

      // Use mock storage in development or when S3 is not configured
      if (!USE_S3_STORAGE || !process.env.AWS_ACCESS_KEY_ID) {
        console.log('Using mock S3 storage (S3 not configured)');
        return await mockStorage.upload(file, key);
      }

      console.log('Uploading to S3:', { bucket: BUCKET_NAME, key, size: file.size });

      // Convert file to buffer
      const buffer = await file.arrayBuffer();
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: new Uint8Array(buffer),
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(command);

      // Return the public URL
      const publicUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
      console.log('S3 upload completed:', publicUrl);
      
      return publicUrl;
    } catch (error) {
      console.error('S3 upload error:', error);
      
      // Fallback to mock storage
      console.log('S3 upload failed, using mock storage');
      const key = `${path}/${fileName || `${Date.now()}_${file.name}`}`;
      return await mockStorage.upload(file, key);
    }
  }

  /**
   * Delete a file from S3
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract key from URL
      const key = this.extractKeyFromUrl(fileUrl);
      
      if (!key) {
        console.warn('Could not extract key from URL:', fileUrl);
        return;
      }

      // Skip deletion for external URLs
      if (!fileUrl.includes(BUCKET_NAME) && !fileUrl.includes('mock=true')) {
        console.warn('Skipping deletion of external URL:', fileUrl);
        return;
      }

      // Use mock storage in development
      if (!USE_S3_STORAGE || !process.env.AWS_ACCESS_KEY_ID || fileUrl.includes('mock=true')) {
        await mockStorage.delete(key);
        return;
      }

      console.log('Deleting from S3:', { bucket: BUCKET_NAME, key });

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      console.log('S3 deletion completed');
    } catch (error) {
      console.error('S3 deletion error:', error);
      // Don't throw error for deletion failures
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
    try {
      // Upload new file first
      const newFileUrl = await this.uploadFile(newFile, path, fileName);
      
      // Delete old file (don't wait for it)
      if (oldFileUrl) {
        this.deleteFile(oldFileUrl).catch(err => 
          console.warn('Failed to delete old file:', err)
        );
      }
      
      return newFileUrl;
    } catch (error) {
      console.error('Error replacing file:', error);
      throw new Error('Failed to replace file');
    }
  }

  /**
   * Generate a signed URL for private file access
   */
  static async getSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
    try {
      const key = this.extractKeyFromUrl(fileUrl);
      
      if (!key) {
        return fileUrl; // Return original URL if key extraction fails
      }

      // Return mock URL for development
      if (!USE_S3_STORAGE || !process.env.AWS_ACCESS_KEY_ID || fileUrl.includes('mock=true')) {
        return await mockStorage.getSignedUrl(key);
      }

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return fileUrl; // Return original URL on error
    }
  }

  /**
   * Extract S3 key from URL
   */
  private static extractKeyFromUrl(url: string): string | null {
    try {
      // Handle S3 URLs
      if (url.includes('.s3.amazonaws.com/')) {
        const parts = url.split('.s3.amazonaws.com/')[1];
        return parts?.split('?')[0] || null;
      }
      
      // Handle mock URLs
      if (url.includes('mock=true')) {
        const urlObj = new URL(url);
        return urlObj.pathname.substring(1); // Remove leading slash
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting key from URL:', error);
      return null;
    }
  }

  /**
   * Check if S3 is properly configured
   */
  static isConfigured(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET
    );
  }
}

// Clinical Images specific functions using S3
export const clinicalImagesS3Storage = {
  // Upload clinical image
  async uploadClinicalImage(
    file: File, 
    patientId: string, 
    imageType: string
  ): Promise<string> {
    const timestamp = Date.now();
    const fileName = `${patientId}_${imageType}_${timestamp}_${file.name}`;
    return await S3StorageService.uploadFile(file, 'clinical-images', fileName);
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
    return await S3StorageService.replaceFile(oldImageUrl, newFile, 'clinical-images', fileName);
  },

  // Delete clinical image
  async deleteClinicalImage(imageUrl: string): Promise<void> {
    return await S3StorageService.deleteFile(imageUrl);
  },

  // Get signed URL for secure access
  async getSignedImageUrl(imageUrl: string): Promise<string> {
    return await S3StorageService.getSignedUrl(imageUrl);
  }
};

// Profile images storage
export const profileImagesS3Storage = {
  async uploadProfileImage(file: File, userId: string): Promise<string> {
    const fileName = `${userId}_profile_${Date.now()}_${file.name}`;
    return await S3StorageService.uploadFile(file, 'profile-images', fileName);
  },

  async replaceProfileImage(oldImageUrl: string, newFile: File, userId: string): Promise<string> {
    const fileName = `${userId}_profile_${Date.now()}_${newFile.name}`;
    return await S3StorageService.replaceFile(oldImageUrl, newFile, 'profile-images', fileName);
  },

  async deleteProfileImage(imageUrl: string): Promise<void> {
    return await S3StorageService.deleteFile(imageUrl);
  }
};

// Documents storage
export const documentsS3Storage = {
  async uploadDocument(file: File, patientId: string, documentType: string): Promise<string> {
    const fileName = `${patientId}_${documentType}_${Date.now()}_${file.name}`;
    return await S3StorageService.uploadFile(file, 'documents', fileName);
  },

  async replaceDocument(oldDocUrl: string, newFile: File, patientId: string, documentType: string): Promise<string> {
    const fileName = `${patientId}_${documentType}_${Date.now()}_${newFile.name}`;
    return await S3StorageService.replaceFile(oldDocUrl, newFile, 'documents', fileName);
  },

  async deleteDocument(docUrl: string): Promise<void> {
    return await S3StorageService.deleteFile(docUrl);
  },

  async getSignedDocumentUrl(docUrl: string): Promise<string> {
    return await S3StorageService.getSignedUrl(docUrl);
  }
};

export default S3StorageService;