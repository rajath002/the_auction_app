import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

/**
 * GET - Test ImageKit credentials
 * This endpoint helps verify if your ImageKit credentials are correctly configured
 */
export async function GET(request: NextRequest) {
  try {
    // Check if credentials are present
    const hasPublicKey = !!process.env.IMAGEKIT_PUBLIC_KEY;
    const hasPrivateKey = !!process.env.IMAGEKIT_PRIVATE_KEY;
    const hasUrlEndpoint = !!process.env.IMAGEKIT_URL_ENDPOINT;

    if (!hasPublicKey || !hasPrivateKey || !hasUrlEndpoint) {
      return NextResponse.json({
        success: false,
        error: 'Missing ImageKit credentials',
        details: {
          hasPublicKey,
          hasPrivateKey,
          hasUrlEndpoint,
        },
      }, { status: 500 });
    }

    // Initialize ImageKit
    const imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    });

    // Try to list files (this will test authentication)
    try {
      await imagekit.listFiles({
        limit: 1,
      });

      return NextResponse.json({
        success: true,
        message: 'ImageKit credentials are valid!',
        config: {
          publicKey: process.env.IMAGEKIT_PUBLIC_KEY?.substring(0, 15) + '...',
          privateKeyLength: process.env.IMAGEKIT_PRIVATE_KEY?.length,
          urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        },
      });
    } catch (authError: any) {
      return NextResponse.json({
        success: false,
        error: 'Authentication failed',
        details: authError.message,
        hint: 'Please verify your ImageKit credentials from https://imagekit.io/dashboard',
      }, { status: 401 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Failed to test ImageKit credentials',
      details: error.message,
    }, { status: 500 });
  }
}
