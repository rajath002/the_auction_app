# ImageKit API Documentation

This document describes the ImageKit image upload/management API endpoints.

## Setup

### 1. Install ImageKit Package

```bash
npm install imagekit
```

### 2. Get ImageKit Credentials

1. Sign up at [ImageKit.io](https://imagekit.io/)
2. Go to Developer Options in your dashboard
3. Copy the following credentials:
   - Public Key
   - Private Key
   - URL Endpoint

### 3. Configure Environment Variables

Add to your `.env.local` file:

```bash
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

## API Endpoints

Base URL: `/api/upload/imagekit`

---

## POST - Upload Image

Upload a new image to ImageKit.

### Request

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Body Parameters:**
- `file` (required) - The image file to upload
- `fileName` (optional) - Custom filename for the uploaded image
- `folder` (optional) - Folder path in ImageKit (default: `/players`)

### Example Usage

```javascript
// Using FormData
const formData = new FormData();
formData.append('file', imageFile);
formData.append('fileName', 'player-profile.jpg');
formData.append('folder', '/players');

const response = await fetch('/api/upload/imagekit', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "fileId": "unique_file_id",
    "fileName": "player-profile.jpg",
    "url": "https://ik.imagekit.io/your_id/players/player-profile.jpg",
    "thumbnailUrl": "https://ik.imagekit.io/your_id/tr:n-media_library_thumbnail/players/player-profile.jpg",
    "filePath": "/players/player-profile.jpg",
    "size": 150000,
    "fileType": "image/jpeg"
  }
}
```

**Error (400/500):**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Validation Rules
- **File Types:** JPEG, PNG, WEBP, GIF only
- **Max Size:** 5MB
- **Required:** File must be provided

---

## GET - Retrieve Images

Get image details or list images in a folder.

### Request

**Method:** `GET`

**Query Parameters:**
- `fileId` (optional) - Get specific file details by ID
- `folder` (optional) - Folder path to list files from (default: `/players`)
- `limit` (optional) - Number of files to return (default: 20)
- `skip` (optional) - Number of files to skip for pagination (default: 0)

### Example Usage

```javascript
// Get specific file details
const response = await fetch('/api/upload/imagekit?fileId=abc123');
const data = await response.json();

// List files in folder
const response = await fetch('/api/upload/imagekit?folder=/players&limit=10&skip=0');
const data = await response.json();
```

### Response

**Single File (200):**
```json
{
  "success": true,
  "data": {
    "fileId": "unique_file_id",
    "fileName": "player-profile.jpg",
    "url": "https://ik.imagekit.io/your_id/players/player-profile.jpg",
    "thumbnailUrl": "https://ik.imagekit.io/your_id/tr:n-media_library_thumbnail/players/player-profile.jpg",
    "filePath": "/players/player-profile.jpg",
    "size": 150000,
    "fileType": "image/jpeg",
    "createdAt": "2025-11-10T12:00:00.000Z",
    "updatedAt": "2025-11-10T12:00:00.000Z",
    "tags": ["player", "profile"]
  }
}
```

**File List (200):**
```json
{
  "success": true,
  "message": "Found 5 images",
  "data": [
    {
      "fileId": "file_id_1",
      "fileName": "player1.jpg",
      "url": "https://ik.imagekit.io/your_id/players/player1.jpg",
      "thumbnailUrl": "https://ik.imagekit.io/your_id/tr:n-media_library_thumbnail/players/player1.jpg",
      "filePath": "/players/player1.jpg",
      "size": 150000,
      "fileType": "image/jpeg",
      "createdAt": "2025-11-10T12:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "skip": 0,
    "count": 5
  }
}
```

---

## PUT - Update Image

Update image metadata (tags, coordinates, etc.).

### Request

**Method:** `PUT`

**Content-Type:** `application/json`

**Body Parameters:**
- `fileId` (required) - The file ID to update
- `tags` (optional) - Array of tags to add
- `customCoordinates` (optional) - Custom crop coordinates
- `removeAITags` (optional) - Boolean to remove AI-generated tags

### Example Usage

```javascript
const response = await fetch('/api/upload/imagekit', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileId: 'abc123',
    tags: ['player', 'team-a', 'batsman'],
  }),
});

const data = await response.json();
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Image updated successfully",
  "data": {
    "fileId": "unique_file_id",
    "fileName": "player-profile.jpg",
    "url": "https://ik.imagekit.io/your_id/players/player-profile.jpg",
    "thumbnailUrl": "https://ik.imagekit.io/your_id/tr:n-media_library_thumbnail/players/player-profile.jpg",
    "filePath": "/players/player-profile.jpg",
    "tags": ["player", "team-a", "batsman"],
    "updatedAt": "2025-11-10T13:00:00.000Z"
  }
}
```

---

## DELETE - Delete Image

Delete an image from ImageKit.

### Request

**Method:** `DELETE`

**Content-Type:** `application/json`

**Body Parameters:**
- `fileId` (required) - The file ID to delete

### Example Usage

```javascript
const response = await fetch('/api/upload/imagekit', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileId: 'abc123',
  }),
});

const data = await response.json();
```

### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## Complete React Component Example

```typescript
'use client';

import { useState } from 'react';

export default function ImageUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', '/players');

    try {
      const response = await fetch('/api/upload/imagekit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedImage(result.data);
        alert('Image uploaded successfully!');
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch('/api/upload/imagekit', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedImage(null);
        alert('Image deleted successfully!');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Upload Image</h2>
      
      <input 
        type="file" 
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="mb-4"
      />
      
      <button 
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      {uploadedImage && (
        <div className="mt-4">
          <h3 className="text-xl mb-2">Uploaded Image</h3>
          <img 
            src={uploadedImage.url} 
            alt={uploadedImage.fileName}
            className="max-w-md mb-2"
          />
          <p>File ID: {uploadedImage.fileId}</p>
          <p>File Name: {uploadedImage.fileName}</p>
          <p>Size: {(uploadedImage.size / 1024).toFixed(2)} KB</p>
          <button 
            onClick={() => handleDelete(uploadedImage.fileId)}
            className="bg-red-500 text-white px-4 py-2 rounded mt-2"
          >
            Delete Image
          </button>
        </div>
      )}
    </div>
  );
}
```

## ImageKit Image Transformations

ImageKit provides powerful URL-based image transformations. You can modify the image URL to apply transformations:

```javascript
// Original URL
const originalUrl = 'https://ik.imagekit.io/your_id/players/player.jpg';

// Resize to 300x300
const resizedUrl = 'https://ik.imagekit.io/your_id/tr:w-300,h-300/players/player.jpg';

// Thumbnail with quality
const thumbnailUrl = 'https://ik.imagekit.io/your_id/tr:w-150,h-150,q-80/players/player.jpg';

// Rounded corners
const roundedUrl = 'https://ik.imagekit.io/your_id/tr:r-20/players/player.jpg';

// Multiple transformations
const transformedUrl = 'https://ik.imagekit.io/your_id/tr:w-400,h-400,r-10,q-90/players/player.jpg';
```

### Common Transformations

- `w-{width}` - Width in pixels
- `h-{height}` - Height in pixels
- `q-{quality}` - Quality (1-100)
- `r-{radius}` - Border radius
- `fo-auto` - Smart crop with focus on important areas
- `f-auto` - Auto format (WebP for supported browsers)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (validation error)
- `500` - Server Error

## Security Considerations

1. **Environment Variables:** Never expose private keys in client-side code
2. **File Validation:** Always validate file types and sizes
3. **Rate Limiting:** Consider implementing rate limiting for uploads
4. **Authentication:** Add authentication to protect upload endpoints
5. **CORS:** Configure CORS if accessing from different domains

## Next Steps

1. Set up ImageKit account and get credentials
2. Add environment variables to `.env.local`
3. Test the API endpoints using the provided examples
4. Integrate with your player registration form
5. Add authentication middleware if needed
6. Implement error handling and loading states in your UI
