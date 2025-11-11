import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';
import sharp from 'sharp';

// Initialize ImageKit instance
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

/**
 * POST - Upload a new image to ImageKit
 * Body: FormData with 'file' field and optional 'fileName' and 'folder'
 */
export async function POST(request: NextRequest) {
  try {
    // Check if ImageKit is configured
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      console.error('ImageKit credentials missing:', {
        hasPublicKey: !!process.env.IMAGEKIT_PUBLIC_KEY,
        hasPrivateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
        hasUrlEndpoint: !!process.env.IMAGEKIT_URL_ENDPOINT,
      });
      return NextResponse.json(
        { error: 'ImageKit is not configured. Please set environment variables.' },
        { status: 500 }
      );
    }

    console.log('ImageKit credentials check:', {
      publicKeyLength: process.env.IMAGEKIT_PUBLIC_KEY?.length,
      privateKeyLength: process.env.IMAGEKIT_PRIVATE_KEY?.length,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const folder = formData.get('folder') as string || '/players';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    // Compress image using sharp
    try {
      console.log('Original file size:', buffer.length, 'bytes');
      console.log('Original file type:', file.type);
      
      const sharpInstance = sharp(buffer).resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true, // Don't enlarge if image is smaller
      });

      // Apply format-specific compression
      if (file.type === 'image/png' || file.type.includes('png')) {
        buffer = await sharpInstance
          .png({
            quality: 80, // PNG quality (1-100)
            compressionLevel: 9, // Maximum compression (0-9)
            progressive: true,
          })
          .toBuffer();
      } else if (file.type === 'image/webp' || file.type.includes('webp')) {
        buffer = await sharpInstance
          .webp({
            quality: 80, // WebP quality (1-100)
          })
          .toBuffer();
      } else {
        // Default to JPEG for other formats (jpeg, jpg, gif, etc.)
        buffer = await sharpInstance
          .jpeg({
            quality: 80, // JPEG quality (1-100)
            progressive: true,
          })
          .toBuffer();
      }
      
      console.log('Compressed file size:', buffer.length, 'bytes');
      console.log('Compression ratio:', ((1 - buffer.length / bytes.byteLength) * 100).toFixed(2) + '%');
    } catch (compressionError) {
      console.error('Image compression failed, using original:', compressionError);
      // If compression fails, continue with original buffer
    }

    // Convert to base64
    const base64File = buffer.toString('base64');

    // Generate unique filename if not provided
    const uniqueFileName = fileName || `${Date.now()}_${file.name}`;

    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: base64File,
      fileName: uniqueFileName,
      folder: folder,
      useUniqueFileName: true,
      tags: ['player', 'profile'],
    });

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        fileId: uploadResponse.fileId,
        fileName: uploadResponse.name,
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        filePath: uploadResponse.filePath,
        size: uploadResponse.size,
        fileType: uploadResponse.fileType,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve image details or list images
 * Query params: 
 * - fileId: Get specific file details
 * - folder: List files in a folder
 * - limit: Number of files to return (default: 20)
 * - skip: Number of files to skip (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Check if ImageKit is configured
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      return NextResponse.json(
        { error: 'ImageKit is not configured. Please set environment variables.' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');
    const folder = searchParams.get('folder') || '/players';
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Get specific file details
    if (fileId) {
      const fileDetails = await imagekit.getFileDetails(fileId);
      
      return NextResponse.json({
        success: true,
        data: {
          fileId: fileDetails.fileId,
          fileName: fileDetails.name,
          url: fileDetails.url,
          thumbnailUrl: (fileDetails as any).thumbnailUrl,
          filePath: fileDetails.filePath,
          size: fileDetails.size,
          fileType: fileDetails.fileType,
          createdAt: fileDetails.createdAt,
          updatedAt: fileDetails.updatedAt,
          tags: fileDetails.tags,
        },
      }, { status: 200 });
    }

    // List files in folder
    const filesList = await imagekit.listFiles({
      path: folder,
      limit: limit,
      skip: skip,
    });

    const files = filesList.map((file: any) => ({
      fileId: file.fileId,
      fileName: file.name,
      url: file.url,
      thumbnailUrl: file.thumbnailUrl,
      filePath: file.filePath,
      size: file.size,
      fileType: file.fileType,
      createdAt: file.createdAt,
    }));

    return NextResponse.json({
      success: true,
      message: `Found ${files.length} images`,
      data: files,
      pagination: {
        limit,
        skip,
        count: files.length,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error retrieving images:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update image details (name, tags, custom metadata)
 * Body: JSON with fileId and fields to update
 */
export async function PUT(request: NextRequest) {
  try {
    // Check if ImageKit is configured
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      return NextResponse.json(
        { error: 'ImageKit is not configured. Please set environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fileId, tags, customCoordinates, removeAITags } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    // Update file details
    const updateData: any = {};
    
    if (tags) {
      updateData.tags = tags;
    }
    
    if (customCoordinates) {
      updateData.customCoordinates = customCoordinates;
    }
    
    if (removeAITags !== undefined) {
      updateData.removeAITags = removeAITags;
    }

    const updatedFile = await imagekit.updateFileDetails(fileId, updateData);

    return NextResponse.json({
      success: true,
      message: 'Image updated successfully',
      data: {
        fileId: updatedFile.fileId,
        fileName: updatedFile.name,
        url: updatedFile.url,
        thumbnailUrl: (updatedFile as any).thumbnailUrl,
        filePath: updatedFile.filePath,
        tags: updatedFile.tags,
        updatedAt: updatedFile.updatedAt,
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete an image from ImageKit
 * Body: JSON with fileId
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check if ImageKit is configured
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      return NextResponse.json(
        { error: 'ImageKit is not configured. Please set environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    // Delete file from ImageKit
    await imagekit.deleteFile(fileId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
