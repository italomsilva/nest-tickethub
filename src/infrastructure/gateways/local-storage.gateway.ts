import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { IStorageGateway, UploadInput } from '../../application/gateways/storage.gateway';

@Injectable()
export class LocalStorageGateway implements IStorageGateway {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  async upload(file: UploadInput): Promise<string> {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const uniqueId = Math.random().toString(36).substring(2, 15);
    const sanitizedFilename = file.filename.replace(/\s+/g, '-');
    const newFilename = `${uniqueId}-${sanitizedFilename}`;
    const filePath = path.join(this.uploadDir, newFilename);

    await fs.promises.writeFile(filePath, file.buffer);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${newFilename}`;
  }
}
