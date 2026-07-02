/**
 * Uploads a file to Cloudflare R2 via Netlify serverless function proxy and returns the public URL.
 * @param file The File object to upload
 * @param folder The folder path (e.g. 'products' or 'categories' or 'hero')
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(file: File, folder: string): Promise<string> {
  if (!file) throw new Error('No file provided');

  try {
    const response = await fetch('/api/upload-to-r2', {
      method: 'POST',
      body: file,
      headers: {
        'Content-Type': file.type,
        'X-Filename': file.name,
        'X-Folder': folder,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || errData.error || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('Response did not contain URL');
    }

    return data.url;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to Cloudflare R2: ' + (error as Error).message);
  }
}
