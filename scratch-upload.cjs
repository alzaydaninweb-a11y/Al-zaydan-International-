const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

const client = new S3Client({
  region: 'auto',
  endpoint: 'https://c6d0beb5fb1d60a07a3e4e93ad65771f.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'fde0a6b90c5a7b5b01739e7a3401ab0d',
    secretAccessKey: '310eb488e8ae4f0e82e0c0fb83219a91e12281d836e2abdfda43ad76319383c7',
  },
});

async function uploadFile() {
  const command = new PutObjectCommand({
    Bucket: 'alzaydan',
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
