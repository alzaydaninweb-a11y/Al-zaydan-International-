const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.VITE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

async function setCors() {
  const command = new PutBucketCorsCommand({
    Bucket: process.env.VITE_R2_BUCKET_NAME || 'alzaydan',
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: [],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  });

  try {
    const data = await client.send(command);
    console.log('CORS updated successfully:', data);
  } catch (error) {
    console.error('Error setting CORS:', error);
  }
}

setCors();
