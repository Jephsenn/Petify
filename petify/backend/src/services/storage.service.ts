import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Storage Service for managing local file storage
 */
class StorageService {
  private uploadsDir: string;
  private generatedDir: string;

  constructor() {
    const rootDir = path.join(__dirname, '..', '..');
    this.uploadsDir = path.join(rootDir, 'uploads');
    this.generatedDir = path.join(rootDir, 'generated');
  }

  /**
   * Ensures storage directories exist
   */
  async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
      await fs.mkdir(this.generatedDir, { recursive: true });
      console.log('[Storage] Storage directories initialized');
    } catch (error) {
      console.error('[Storage] Error creating directories:', error);
    }
  }

  /**
   * Downloads an image from a URL and saves it locally
   */
  async downloadImage(url: string, filename: string): Promise<string> {
    console.log(`[Storage] Downloading image: ${filename}`);
    
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      const filepath = path.join(this.generatedDir, filename);
      await fs.writeFile(filepath, response.data);

      console.log(`[Storage] Image saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('[Storage] Error downloading image:', error);
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the public URL for a stored file
   */
  getPublicUrl(filename: string, type: 'upload' | 'generated' = 'generated'): string {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    return `${baseUrl}/${type}/${filename}`;
  }

  /**
   * Deletes a file from storage
   */
  async deleteFile(filepath: string): Promise<void> {
    try {
      await fs.unlink(filepath);
      console.log(`[Storage] File deleted: ${filepath}`);
    } catch (error) {
      console.error('[Storage] Error deleting file:', error);
    }
  }

  /**
   * Gets the uploads directory path
   */
  getUploadsDir(): string {
    return this.uploadsDir;
  }

  /**
   * Gets the generated images directory path
   */
  getGeneratedDir(): string {
    return this.generatedDir;
  }
}

export const storageService = new StorageService();
