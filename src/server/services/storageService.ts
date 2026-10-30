import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface B2AuthCache {
  accountId: string;
  apiUrl: string;
  downloadUrl: string;
  authorizationToken: string;
  expiresAt: number;
}

interface UploadResult {
  url: string;
  fileName: string;
  fileKey: string;
  size: number;
  mimeType: string;
  storageProvider: 'b2' | 'local';
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

let b2AuthCache: B2AuthCache | null = null;
let b2BucketIdCache: string | null = null;
let b2BucketNameCache: string | null = null;

export class StorageService {
  /**
   * Validates that buffer starts with valid image magic bytes.
   */
  static validateImageBuffer(buffer: Buffer): { valid: boolean; detectedMime?: string } {
    if (buffer.length < 12) return { valid: false };

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { valid: true, detectedMime: 'image/png' };
    }

    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { valid: true, detectedMime: 'image/jpeg' };
    }

    // GIF: 47 49 46 38 (GIF87a or GIF89a)
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return { valid: true, detectedMime: 'image/gif' };
    }

    // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return { valid: true, detectedMime: 'image/webp' };
    }

    // Allow AVIF (ftypavif header)
    if (
      buffer.length >= 16 &&
      buffer[4] === 0x66 &&
      buffer[5] === 0x74 &&
      buffer[6] === 0x79 &&
      buffer[7] === 0x70
    ) {
      return { valid: true, detectedMime: 'image/avif' };
    }

    return { valid: false };
  }

  /**
   * Inspects if Backblaze B2 is configured with valid environment variables.
   */
  static isB2Configured(): boolean {
    const keyId = process.env.B2_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.B2_BUCKET_NAME;
    return Boolean(keyId && applicationKey && bucketName);
  }

  /**
   * Authorizes with Backblaze B2 API and caches token for 20 hours.
   */
  private static async getB2Auth(): Promise<B2AuthCache | null> {
    if (b2AuthCache && Date.now() < b2AuthCache.expiresAt) {
      return b2AuthCache;
    }

    const keyId = process.env.B2_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const applicationKey = process.env.B2_APPLICATION_KEY || process.env.AWS_SECRET_ACCESS_KEY;

    if (!keyId || !applicationKey) {
      return null;
    }

    const credentials = Buffer.from(`${keyId}:${applicationKey}`).toString('base64');
    const authRes = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!authRes.ok) {
      console.error('[StorageService] Backblaze B2 authorization failed:', authRes.status);
      return null;
    }

    const data = await authRes.json();
    b2AuthCache = {
      accountId: data.accountId,
      apiUrl: data.apiUrl,
      downloadUrl: data.downloadUrl,
      authorizationToken: data.authorizationToken,
      expiresAt: Date.now() + 20 * 60 * 60 * 1000, // 20 hours
    };

    return b2AuthCache;
  }

  /**
   * Resolves the Backblaze B2 Bucket ID for the configured bucket name.
   */
  private static async getB2BucketId(auth: B2AuthCache): Promise<string | null> {
    if (b2BucketIdCache) return b2BucketIdCache;

    const bucketName = process.env.B2_BUCKET_NAME || 'aveezfashion';
    const res = await fetch(`${auth.apiUrl}/b2api/v2/b2_list_buckets`, {
      method: 'POST',
      headers: {
        Authorization: auth.authorizationToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: auth.accountId,
        bucketName,
      }),
    });

    if (!res.ok) {
      console.error('[StorageService] Failed to list B2 buckets:', res.status);
      return null;
    }

    const data = await res.json();
    const bucket = data.buckets?.[0];
    if (bucket && bucket.bucketId) {
      b2BucketIdCache = bucket.bucketId;
      b2BucketNameCache = bucket.bucketName || bucketName;
      return bucket.bucketId;
    }

    return null;
  }

  /**
   * Attempts to save a local backup copy in public/uploads/ for development and caching.
   * Never throws if operating in a serverless or read-only environment (e.g. Vercel, AWS Lambda).
   */
  private static trySaveLocalFile(subPath: string, buffer: Buffer): boolean {
    try {
      const localFilePath = path.resolve('public/uploads', subPath);
      const localDir = path.dirname(localFilePath);
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      fs.writeFileSync(localFilePath, buffer);
      return true;
    } catch (err: any) {
      // Gracefully ignore read-only file systems (EROFS) in cloud deployments
      console.warn(`[StorageService] Local disk write skipped for "${subPath}" (${err.code || err.message}).`);
      return false;
    }
  }

  /**
   * Uploads an image file buffer to Backblaze B2 or local disk storage.
   */
  static async uploadProductImage(
    buffer: Buffer,
    originalFilename: string,
    mimeType: string
  ): Promise<UploadResult> {
    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 10MB.`);
    }

    const sanitizedBase = path.basename(originalFilename).toLowerCase();
    const ext = sanitizedBase.split('.').pop() || 'jpg';

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error(`File extension .${ext} is not allowed. Supported formats: JPG, PNG, WEBP, GIF, AVIF.`);
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Unsupported image MIME type: ${mimeType}.`);
    }

    const magicByteCheck = this.validateImageBuffer(buffer);
    if (!magicByteCheck.valid) {
      throw new Error('File content does not match a valid image header signature.');
    }

    const finalMime = magicByteCheck.detectedMime || mimeType;
    const uniqueId = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const generatedFileName = `prod-${uniqueId}.${ext}`;
    const fileKey = `products/${generatedFileName}`;

    // 1. Primary Cloud Storage: Backblaze B2 (when configured)
    if (this.isB2Configured()) {
      try {
        const auth = await this.getB2Auth();
        if (auth) {
          const bucketId = await this.getB2BucketId(auth);
          if (bucketId) {
            // Get upload URL
            const getUploadUrlRes = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
              method: 'POST',
              headers: {
                Authorization: auth.authorizationToken,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ bucketId }),
            });

            if (getUploadUrlRes.ok) {
              const uploadUrlData = await getUploadUrlRes.json();
              const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');

              const b2UploadRes = await fetch(uploadUrlData.uploadUrl, {
                method: 'POST',
                headers: {
                  Authorization: uploadUrlData.authorizationToken,
                  'X-Bz-File-Name': encodeURIComponent(fileKey),
                  'Content-Type': finalMime,
                  'Content-Length': String(buffer.length),
                  'X-Bz-Content-Sha1': sha1,
                },
                body: new Uint8Array(buffer),
              });

              if (b2UploadRes.ok) {
                // Best-effort local cache for local dev / writable environments
                this.trySaveLocalFile(fileKey, buffer);

                // Return media gateway URL that streams verified private B2 assets securely
                return {
                  url: `/api/media/${fileKey}`,
                  fileName: generatedFileName,
                  fileKey,
                  size: buffer.length,
                  mimeType: finalMime,
                  storageProvider: 'b2',
                };
              } else {
                const errText = await b2UploadRes.text().catch(() => '');
                console.warn('[StorageService] B2 file upload request returned non-200:', b2UploadRes.status, errText);
              }
            } else {
              const errText = await getUploadUrlRes.text().catch(() => '');
              console.warn('[StorageService] B2 get_upload_url failed:', getUploadUrlRes.status, errText);
            }
          }
        }
      } catch (b2Error) {
        console.warn('[StorageService] B2 upload encountered an error:', b2Error);
      }
    }

    // 2. Local fallback (for local development where public/uploads is writable)
    const savedLocally = this.trySaveLocalFile(fileKey, buffer);
    if (savedLocally) {
      return {
        url: `/uploads/products/${generatedFileName}`,
        fileName: generatedFileName,
        fileKey,
        size: buffer.length,
        mimeType: finalMime,
        storageProvider: 'local',
      };
    }

    // 3. Fallback failure notice if in read-only environment and B2 is inaccessible
    throw new Error(
      'Image upload failed: The server filesystem is read-only and Backblaze B2 cloud storage is not accessible. Please ensure B2_KEY_ID, B2_APPLICATION_KEY, and B2_BUCKET_NAME are configured in your deployment environment variables.'
    );
  }

  /**
   * Uploads an optimized campaign asset (e.g., Diwali hero, men, women) to Backblaze B2.
   * Also ensures a local disk copy in public/uploads/ for fast CDN and zero-latency fallback.
   */
  static async uploadCampaignAsset(
    buffer: Buffer,
    fileKey: string,
    mimeType: string = 'image/webp'
  ): Promise<UploadResult> {
    const fileName = path.basename(fileKey);

    // 1. Primary Cloud Storage: Backblaze B2 (when configured)
    if (this.isB2Configured()) {
      try {
        const auth = await this.getB2Auth();
        if (auth) {
          const bucketId = await this.getB2BucketId(auth);
          if (bucketId) {
            const getUploadUrlRes = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_upload_url`, {
              method: 'POST',
              headers: {
                Authorization: auth.authorizationToken,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ bucketId }),
            });

            if (getUploadUrlRes.ok) {
              const uploadUrlData = await getUploadUrlRes.json();
              const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');

              const b2UploadRes = await fetch(uploadUrlData.uploadUrl, {
                method: 'POST',
                headers: {
                  Authorization: uploadUrlData.authorizationToken,
                  'X-Bz-File-Name': encodeURIComponent(fileKey),
                  'Content-Type': mimeType,
                  'Content-Length': String(buffer.length),
                  'X-Bz-Content-Sha1': sha1,
                },
                body: new Uint8Array(buffer),
              });

              if (b2UploadRes.ok) {
                // Best-effort local cache for local dev / writable environments
                this.trySaveLocalFile(fileKey, buffer);

                return {
                  url: `/api/media/${fileKey}`,
                  fileName,
                  fileKey,
                  size: buffer.length,
                  mimeType,
                  storageProvider: 'b2',
                };
              } else {
                console.warn('[StorageService] B2 campaign upload returned non-200, falling back to local.');
              }
            }
          }
        }
      } catch (err) {
        console.warn('[StorageService] Error during B2 campaign upload:', err);
      }
    }

    // 2. Local fallback
    const savedLocally = this.trySaveLocalFile(fileKey, buffer);
    if (savedLocally) {
      return {
        url: `/uploads/${fileKey}`,
        fileName,
        fileKey,
        size: buffer.length,
        mimeType,
        storageProvider: 'local',
      };
    }

    throw new Error(
      'Campaign asset upload failed: Server filesystem is read-only and Backblaze B2 is not accessible. Please check your cloud storage environment variables.'
    );
  }

  /**
   * Fetches an asset buffer from Backblaze B2 with authorization.
   */
  static async fetchB2Asset(fileKey: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    try {
      const auth = await this.getB2Auth();
      if (!auth) return null;

      if (!b2BucketNameCache) {
        await this.getB2BucketId(auth);
      }
      const bucketName = b2BucketNameCache || process.env.B2_BUCKET_NAME || 'aveezfashion';
      const downloadUrl = `${auth.downloadUrl}/file/${bucketName}/${fileKey}`;

      const res = await fetch(downloadUrl, {
        headers: {
          Authorization: auth.authorizationToken,
        },
      });

      if (!res.ok) return null;

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = res.headers.get('content-type') || 'application/octet-stream';

      return { buffer, mimeType };
    } catch {
      return null;
    }
  }
}

