import { Injectable } from '@nestjs/common';
import { IStorageGateway, UploadInput } from '../../application/gateways/storage.gateway';

@Injectable()
export class AmazonS3StorageGateway implements IStorageGateway {
  async upload(file: UploadInput): Promise<string> {
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const sanitizedFilename = file.filename.replace(/\s+/g, '-');
    const newFilename = `${uniqueId}-${sanitizedFilename}`;

    // Standard simulated or AWS S3 production client logic
    // In production this would do:
    // const s3Client = new S3Client({ region: process.env.AWS_REGION });
    // await s3Client.send(new PutObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: newFilename, Body: file.buffer }));
    
    const bucket = process.env.AWS_BUCKET || 'tickethub-bucket';
    return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
  }
}
