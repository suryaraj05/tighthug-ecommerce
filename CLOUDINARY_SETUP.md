# Cloudinary Setup Instructions

## Credentials (Already Configured)
- Cloud Name: `duyb5ho6b`
- API Key: `723593782495474`
- API Secret: `vyZ9-BRujYKjyYSl8ZrkzCvZcXA`

## Required Setup Steps

1. **Create an Unsigned Upload Preset**
   - Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
   - Navigate to: Settings > Upload > Upload presets
   - Click "Add upload preset"
   - Configure:
     - **Preset name**: `tighthug_upload` (or update in `src/services/cloudinaryService.ts`)
     - **Signing mode**: Select "Unsigned"
     - **Folder**: Optional - set to `tighthug/products` for product images
     - **Format**: Auto (or specify formats)
     - **Transformation**: Optional - set default transformations if needed
   - Click "Save"

2. **Update the Upload Preset Name**
   - If you used a different preset name, update it in:
   - `src/services/cloudinaryService.ts` - line 7: `CLOUDINARY_UPLOAD_PRESET`

## Usage

The Cloudinary service is ready to use:

```typescript
import { uploadImageToCloudinary } from '@/services/cloudinaryService';

// Upload single image
const file = event.target.files[0];
const result = await uploadImageToCloudinary(file, 'tighthug/products');
console.log(result.secure_url); // Use this URL in your database

// Upload multiple images
const files = Array.from(event.target.files);
const results = await uploadMultipleImages(files, 'tighthug/products');
```

## Security Note

- The upload preset is set to "Unsigned" for client-side uploads
- For production, consider using signed uploads via your backend API
- Never expose your API secret key in client-side code

