import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Read Cloudflare R2 credentials from the environment (checking both VITE_ and standard keys)
const r2Endpoint = process.env.VITE_R2_ENDPOINT || process.env.R2_ENDPOINT;
const accessKeyId = process.env.VITE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.VITE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.VITE_R2_BUCKET_NAME || process.env.R2_BUCKET_NAME;
const publicUrl = process.env.VITE_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Filename, X-Folder',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
    };
  }

  try {
    // Netlify normalizes headers to lowercase. Let's lookup keys case-insensitively
    const getHeader = (name) => {
      const lower = name.toLowerCase();
      for (const [key, value] of Object.entries(event.headers)) {
        if (key.toLowerCase() === lower) {
          return value;
        }
      }
      return undefined;
    };

    const contentType = getHeader('content-type') || 'application/octet-stream';
    const filenameHeader = getHeader('x-filename');
    const folder = getHeader('x-folder') || 'products';

    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No file body provided.' })
      };
    }

    // Decode base64 body if encoded by Netlify
    let bodyBuffer;
    if (event.isBase64Encoded) {
      bodyBuffer = Buffer.from(event.body, 'base64');
    } else {
      bodyBuffer = Buffer.from(event.body);
    }

    // Determine target filename
    const originalName = filenameHeader || 'file.bin';
    const extension = originalName.split('.').pop() || 'bin';
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: bodyBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the public URL
    const cleanPublicUrl = publicUrl.replace(/\/$/, '');
    const fileUrl = `${cleanPublicUrl}/${filename}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ url: fileUrl })
    };

  } catch (error) {
    console.error('Error in upload-to-r2 function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to upload to Cloudflare R2', message: error.message })
    };
  }
};
