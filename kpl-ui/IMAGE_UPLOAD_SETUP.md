# Image Upload Setup Guide

This guide explains how to set up image upload functionality for player registration using AWS S3 or GCP Cloud Storage.

## Features

- Upload player profile images during registration
- Store images in AWS S3 or GCP Cloud Storage
- Image validation (type and size)
- Preview uploaded images
- Automatic URL generation
- Seamless integration with createPlayer API

## Quick Start

### Option 1: AWS S3 Setup

1. **Create an AWS Account** (if you don't have one)
   - Go to https://aws.amazon.com/
   - Sign up for a free tier account

2. **Create an S3 Bucket**
   - Go to AWS Console > S3
   - Click "Create bucket"
   - Name: `auction-app-images` (or your preferred name)
   - Region: Choose your preferred region (e.g., `us-east-1`)
   - Block Public Access: Uncheck "Block all public access" if you want images publicly accessible
   - Click "Create bucket"

3. **Configure Bucket Policy** (for public read access)
   - Select your bucket > Permissions > Bucket Policy
   - Add this policy (replace `YOUR_BUCKET_NAME`):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
       }
     ]
   }
   ```

4. **Create IAM User with S3 Access**
   - Go to IAM > Users > Add User
   - User name: `auction-app-uploader`
   - Access type: Programmatic access
   - Attach policy: `AmazonS3FullAccess` (or create custom policy with PutObject permission)
   - Save the Access Key ID and Secret Access Key

5. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Add your AWS credentials:
   ```bash
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=auction-app-images
   ```

### Option 2: GCP Cloud Storage Setup

1. **Create a GCP Account**
   - Go to https://cloud.google.com/
   - Sign up for free tier

2. **Create a Storage Bucket**
   - Go to Cloud Console > Storage > Browser
   - Click "Create bucket"
   - Name: `auction-app-images`
   - Choose location and storage class
   - Set access control to "Fine-grained"

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Create service account with "Storage Admin" role
   - Create and download JSON key file

4. **Update Upload API** (replace AWS code with GCP)
   - Install GCP SDK: `npm install @google-cloud/storage`
   - Update `app/api/upload/route.ts` to use GCP Storage client

5. **Configure Environment Variables**
   ```bash
   GCP_PROJECT_ID=your_project_id
   GCP_BUCKET_NAME=auction-app-images
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   ```

## Usage

### In the Application

1. Navigate to Player Registration page
2. Fill in player details
3. Click "Upload Image" button
4. Select an image (JPG, PNG, or WebP, max 5MB)
5. Image will be uploaded to cloud storage
6. Preview appears after successful upload
7. Submit the form - image URL is sent to createPlayer API

### API Endpoint

**POST** `/api/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field

**Response:**
```json
{
  "success": true,
  "url": "https://bucket.s3.region.amazonaws.com/players/uuid.jpg",
  "fileName": "players/uuid.jpg"
}
```

**Error Response:**
```json
{
  "error": "Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed"
}
```

## File Structure

```
app/
  api/
    upload/
      route.ts          # Image upload API endpoint
  player-registration/
    page.tsx            # Main page with imageUrl state
    components/
      RegistrationForm.tsx  # Form with Upload component
```

## Validation Rules

- **File Types**: JPEG, JPG, PNG, WebP only
- **File Size**: Maximum 5MB
- **Max Files**: 1 image per player
- **Naming**: Automatic UUID generation to prevent conflicts

## Troubleshooting

### Upload fails with "No file uploaded"
- Ensure the file input is correctly configured
- Check browser console for errors

### Upload fails with "Failed to upload file"
- Verify AWS credentials in `.env.local`
- Check S3 bucket exists and is accessible
- Verify IAM user has PutObject permission

### Images not displaying
- Check bucket policy allows public read access
- Verify the URL format is correct
- Check browser network tab for 403/404 errors

### CORS errors
- Add CORS configuration to S3 bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. Use **IAM policies** with minimal required permissions
3. Enable **CloudFront** for better security and performance
4. Implement **image optimization** before upload
5. Add **virus scanning** for production
6. Use **signed URLs** for private images
7. Implement **rate limiting** on upload endpoint

## Future Enhancements

- [ ] Image compression before upload
- [ ] Multiple image upload
- [ ] Image cropping/editing
- [ ] CDN integration
- [ ] Image optimization (WebP conversion)
- [ ] Progress indicator for uploads
- [ ] Drag-and-drop upload
- [ ] Batch upload for bulk registration

## Dependencies

```json
{
  "@aws-sdk/client-s3": "^3.x",
  "@aws-sdk/s3-request-presigner": "^3.x",
  "uuid": "^9.x",
  "@types/uuid": "^9.x"
}
```

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review AWS S3 documentation: https://docs.aws.amazon.com/s3/
3. Check Next.js file upload docs: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
