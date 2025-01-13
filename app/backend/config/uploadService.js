import { uploadMultiplePhotos, uploadToS3 } from './s3.js';
import fs from 'fs/promises';

export const handleFileUploads = async (files, business_id, boat_id, bucketName) => {
    try {
      // Upload photos
      const photoUrls = await Promise.all(
        files.photos.map(async (file) => {
          const fullPath = path.resolve(file.path);
          const s3Url = await uploadToS3(
            fullPath, 
            bucketName,
            `business-${business_id}/boat-${boat_id}/photos`,
            path.basename(file.originalname)
          );
          await fs.unlink(fullPath);
          return s3Url;
        })
      );
  
      // Upload boat license
      const licenseFile = files.license[0];
      const fullPath = path.resolve(licenseFile.path);
      const licenseUrl = await uploadToS3(
        fullPath,
        bucketName,
        `business-${business_id}/boat-${boat_id}/license`,
        path.basename(licenseFile.originalname)
      );
      await fs.unlink(fullPath);
  
      return { photoUrls, licenseUrl };
    } catch (err) {
      console.error('Error uploading files:', err);
      throw new Error('Failed to upload files: ' + err.message);
    }
  };
