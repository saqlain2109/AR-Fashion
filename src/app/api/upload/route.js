import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Allowed image MIME types and extensions
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required.' }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded.' }, { status: 400 });
    }

    const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const rootUploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(publicUploadsDir)) {
      fs.mkdirSync(publicUploadsDir, { recursive: true });
    }
    if (!fs.existsSync(rootUploadsDir)) {
      fs.mkdirSync(rootUploadsDir, { recursive: true });
    }

    const uploadedUrls = [];

    for (const file of files) {
      if (typeof file === 'string') continue;

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type "${file.type}". Only JPG, PNG, WEBP, and GIF images are allowed.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds the maximum allowed size of 10MB.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Clean filename
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileName = `${uniqueSuffix}-${originalName}`;
      
      const filePathPublic = path.join(publicUploadsDir, fileName);
      const filePathRoot = path.join(rootUploadsDir, fileName);

      fs.writeFileSync(filePathPublic, buffer);
      try {
        fs.writeFileSync(filePathRoot, buffer);
      } catch (e) {
        // Fallback if root not writable
      }

      uploadedUrls.push(`/uploads/${fileName}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image: ' + (error.message || 'Server error') },
      { status: 500 }
    );
  }
}
