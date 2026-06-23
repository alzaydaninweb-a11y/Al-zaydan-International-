import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2Endpoint = import.meta.env.VITE_R2_ENDPOINT;
const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.VITE_R2_BUCKET_NAME;
const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Uploads a file to Cloudflare R2 and returns the public URL.
 * @param file The File object to upload
 * @param folder The folder path (e.g. 'products' or 'industries')
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(file: File, folder: string): Promise<string> {
  if (!file) throw new Error('No file provided');

  // Create a unique filename
  const extension = file.name.split('.').pop();
  const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    ContentType: file.type,
  });

  try {
    // 1. Generate a pre-signed URL for the upload
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // 2. Upload the file directly using the browser's native fetch
    const response = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    // Return the public URL
    const cleanPublicUrl = publicUrl.replace(/\/$/, '');
    return `${cleanPublicUrl}/${filename}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to Cloudflare R2: ' + (error as Error).message);
  }
}
