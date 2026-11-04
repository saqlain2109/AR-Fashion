import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { exec } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    // Run seed.js via child process
    await new Promise((resolve, reject) => {
      const seedScript = path.join(process.cwd(), 'prisma', 'seed.js');
      exec(`node "${seedScript}"`, (err, stdout, stderr) => {
        if (err) {
          console.error('Seed execution error:', stderr || err);
          return reject(err);
        }
        resolve(stdout);
      });
    });

    try {
      revalidatePath('/', 'layout');
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Boutique sample catalog and settings seeded successfully!',
    });
  } catch (error) {
    console.error('API Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed catalog: ' + (error.message || 'Server error') },
      { status: 500 }
    );
  }
}
