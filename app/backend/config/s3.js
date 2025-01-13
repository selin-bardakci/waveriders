import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import mime from 'mime';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKI',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'wN',
    },
  });
  
  export const uploadMultiplePhotos = async (files, bucketName, businessId, boatId, type) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileContent = fs.readFileSync(file.path);
      const fileExt = path.extname(file.originalname);
      const fileName = `photo-${index + 1}${fileExt}`;
      
      // Create S3 key with proper structure
      const key = `business-${businessId}/${type}/${fileName}`;
      
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: mime.getType(file.path) || 'application/octet-stream',
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      
      // Clean up local file
      fs.unlinkSync(file.path);

      return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    });

    return Promise.all(uploadPromises);
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Error uploading files to S3: ${error.message}`);
  }
};
  

  export const uploadToS3 = async (filePath, bucketName, businessId, type) => {
    console.log('Starting S3 Upload:', { filePath, bucketName, businessId, type });
  
    try {
      // Validate that the file exists
      if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        throw new Error(`File not found at path: ${filePath}`);
      }
  
      const fileContent = fs.readFileSync(filePath); // Read the file
      const fileName = path.basename(filePath); // Extract the file name
  
      // Validate inputs
      if (!businessId || !type || !bucketName) {
        throw new Error('Invalid inputs: Missing businessId, type, or bucketName');
      }
  
      const params = {
        Bucket: bucketName,
        Key: `business-${businessId}/${type}/${fileName}`, // Organized path
        Body: fileContent,
        ContentType: mime.getType(filePath) || 'application/octet-stream',
      };
  
      console.log('S3 Upload Params:', params);
  
      // Perform the S3 upload
      const command = new PutObjectCommand(params);
      const response = await s3Client.send(command);
  
      console.log('S3 Upload Response:', response);
  
      // Construct and return the S3 URL
      const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
      console.log('Generated S3 File URL:', s3Url);
  
      return s3Url;
    } catch (error) {
      console.error('Error in uploadToS3:', {
        filePath,
        bucketName,
        businessId,
        type,
        error: error.message,
      });
      throw new Error(`Error uploading file to S3: ${error.message}`);
    }
  };
  
    export const deleteFromS3 = async (fileUrl) => {
    try {
      const urlParts = new URL(fileUrl);
      const key = urlParts.pathname.substring(1); // Remove leading slash
      const bucketName = urlParts.hostname.split('.')[0];
  
      const params = {
        Bucket: bucketName,
        Key: key,
      };
  
      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Error deleting file from S3: ${error.message}`);
    }
  };
  
  
