import { uploads, type Upload, type InsertUpload } from "@shared/schema";

export interface IStorage {
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: number): Promise<Upload | undefined>;
  getUploads(): Promise<Upload[]>;
}

export class MemStorage implements IStorage {
  private uploads: Map<number, Upload>;
  private currentId: number;

  constructor() {
    this.uploads = new Map();
    this.currentId = 1;
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = this.currentId++;
    const upload: Upload = {
      ...insertUpload,
      id,
      uploadedAt: new Date(),
    };
    this.uploads.set(id, upload);
    return upload;
  }

  async getUpload(id: number): Promise<Upload | undefined> {
    return this.uploads.get(id);
  }

  async getUploads(): Promise<Upload[]> {
    return Array.from(this.uploads.values());
  }
}

export const storage = new MemStorage();
