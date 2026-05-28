export interface UploadInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

export interface IStorageGateway {
  upload(file: UploadInput): Promise<string>; // Retorna a URL pública da imagem
}
