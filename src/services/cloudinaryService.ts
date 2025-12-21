// Cloudinary service for image uploads
// Using unsigned upload preset for client-side uploads

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'duyb5ho6b';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'tighthug_upload';

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
  created_at: string;
}

export const uploadImageToCloudinary = async (
  file: File,
  folder?: string
): Promise<CloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Don't append cloud_name to formData - it's in the URL
    // Cloudinary will use the upload_preset to determine settings
    
    if (folder) {
      formData.append('folder', folder);
    }

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          const errorMessage = errorResponse.error?.message || `Upload failed with status: ${xhr.status}`;
          console.error('Cloudinary upload error:', errorResponse);
          console.error('Upload preset:', CLOUDINARY_UPLOAD_PRESET);
          console.error('Cloud name:', CLOUDINARY_CLOUD_NAME);
          reject(new Error(errorMessage));
        } catch {
          console.error('Cloudinary upload failed. Response:', xhr.responseText);
          reject(new Error(`Upload failed with status: ${xhr.status}. Make sure the upload preset "${CLOUDINARY_UPLOAD_PRESET}" is configured as "unsigned" in Cloudinary.`));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
    xhr.send(formData);
  });
};

export const uploadMultipleImages = async (
  files: File[],
  folder?: string
): Promise<CloudinaryUploadResponse[]> => {
  try {
    const uploadPromises = files.map((file) => uploadImageToCloudinary(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error('Failed to upload images');
  }
};

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  // Note: This requires server-side implementation with API secret
  // For client-side, you'll need to call your backend API
  throw new Error('Image deletion must be done server-side');
};

export const getCloudinaryUrl = (publicId: string, transformations?: string): string => {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const transform = transformations ? `/${transformations}` : '';
  return `${baseUrl}${transform}/${publicId}`;
};
