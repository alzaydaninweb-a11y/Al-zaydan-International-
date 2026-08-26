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

const getAllowedOrigin = (event) => {
  const origin = event.headers.origin || event.headers.Origin;
  if (!origin) return 'https://www.alzaydaninternational.com';

  const allowedOrigins = [
    'https://www.alzaydaninternational.com',
    'https://alzaydaninternational.com',
    'https://alzaydan.com',
  ];

  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  if (/^http:\/\/localhost(:\d+)?$/i.test(origin) || /^http:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin)) {
    return origin;
  }

  if (/^https:\/\/.*--alzaydaninternational\.netlify\.app$/i.test(origin) ||
      /^https:\/\/.*--alzaydan\.netlify\.app$/i.test(origin)) {
    return origin;
  }

  return 'https://www.alzaydaninternational.com';
};

const verifyAuth = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid authorization token.');
  }

  const idToken = authHeader.split(' ')[1];
  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;

  if (!apiKey) {
    throw new Error('Server configuration error: Firebase API Key is missing.');
  }

  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });

  if (!res.ok) {
    throw new Error('Unauthorized: Invalid or expired token.');
  }

  const data = await res.json();
  if (!data.users || data.users.length === 0) {
    throw new Error('Unauthorized: User not found.');
  }

  return data.users[0];
};

export const handler = async (event) => {
  const origin = getAllowedOrigin(event);

  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type, X-Filename, X-Folder, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin
      },
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
    };
  }

  try {
    await verifyAuth(event);
  } catch (authError) {
    return {
      statusCode: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin
      },
      body: JSON.stringify({ error: authError.message })
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin
        },
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
        'Access-Control-Allow-Origin': origin
      },
      body: JSON.stringify({ url: fileUrl })
    };

  } catch (error) {
    console.error('Error in upload-to-r2 function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin
      },
      body: JSON.stringify({ error: 'Failed to upload to Cloudflare R2', message: error.message })
    };
  }
};
