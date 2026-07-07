const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
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

async function uploadFile() {
  const command = new PutObjectCommand({
    Bucket: process.env.VITE_R2_BUCKET_NAME || 'alzaydan',
    Key: 'test/test.txt',
    Body: 'Hello World from R2 API test!',
    ContentType: 'text/plain',
  });

  try {
    const data = await client.send(command);
    console.log('Upload successful:', data);
  } catch (error) {
    console.error('Error uploading:', error);
  }
}

uploadFile();
