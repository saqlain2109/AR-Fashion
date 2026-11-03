import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
};

export async function GET(req, { params }) {
  try {
    const slugParts = params?.slug || [];
    // Sanitize filename to prevent directory traversal
    const filename = slugParts.map((s) => s.replace(/(\.\.[\/\\])/g, '')).join('/');

    if (!filename) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Check public/uploads first, then root uploads
    let filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), 'uploads', filename);
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving uploaded asset:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
