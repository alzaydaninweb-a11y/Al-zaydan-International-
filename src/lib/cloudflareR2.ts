import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { auth, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const r2Endpoint = import.meta.env.VITE_R2_ENDPOINT;
const accessKeyId = import.meta.env.VITE_R2_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_R2_SECRET_ACCESS_KEY;
const bucketName = import.meta.env.VITE_R2_BUCKET_NAME || 'alzaydan';
const publicUrl = import.meta.env.VITE_R2_PUBLIC_URL || 'https://pub-7ee997edc0944df3b82d8c4cec4131a1.r2.dev';

const s3Client = (accessKeyId && secretAccessKey && r2Endpoint)
  ? new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null;

/**
 * Uploads a file directly to Cloudflare R2 bucket and returns the public Cloudflare URL.
 * @param file The File object to upload
 * @param folder The folder path (e.g. 'products' or 'categories' or 'hero')
 * @returns The public Cloudflare R2 URL of the uploaded file
 */
export async function uploadToR2(file: File, folder: string): Promise<string> {
  if (!file) throw new Error('No file provided');

  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  // 1. Direct Cloudflare R2 Upload via AWS S3 Client
  if (s3Client && bucketName) {
    try {
      const buffer = await file.arrayBuffer();
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: cleanName,
        Body: new Uint8Array(buffer),
        ContentType: file.type || 'image/jpeg',
      });
      await s3Client.send(command);
      const cleanPublicBase = publicUrl.replace(/\/+$/, '');
      return `${cleanPublicBase}/${cleanName}`;
    } catch (r2Err) {
      console.warn('Direct Cloudflare R2 upload error, attempting Netlify proxy:', r2Err);
    }
  }

  // 2. Netlify serverless function proxy fallback
  try {
    const idToken = await auth.currentUser?.getIdToken().catch(() => null);
    const headers: Record<string, string> = {
      'Content-Type': file.type,
      'X-Filename': file.name,
      'X-Folder': folder,
    };

    if (idToken) {
      headers['Authorization'] = `Bearer ${idToken}`;
    }

    const response = await fetch('/.netlify/functions/upload-to-r2', {
      method: 'POST',
      body: file,
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        return data.url;
      }
    }
  } catch (fnErr) {
    console.warn('Netlify function upload error:', fnErr);
  }

  // 3. Fallback to Firebase Storage if R2 is completely blocked
  const storageRef = ref(storage, cleanName);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}
