import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabaseStorage, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'properties';

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // 1. Attempt Supabase Storage upload if configured
    if (isSupabaseConfigured) {
      const { url, error } = await uploadToSupabaseStorage(
        bucket,
        `uploads/${sanitizedFileName}`,
        buffer,
        file.type || 'image/jpeg'
      );

      if (url && !error) {
        return NextResponse.json({
          success: true,
          url,
          provider: 'supabase',
          fileName: sanitizedFileName,
          size: file.size,
        });
      }
      console.warn('Supabase storage upload failed, falling back to local storage:', error);
    }

    // 2. Resilient Fallback to local /public/uploads/ storage
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, sanitizedFileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${sanitizedFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      provider: isSupabaseConfigured ? 'local_fallback' : 'local',
      fileName: sanitizedFileName,
      size: file.size,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur d\'upload.' }, { status: 500 });
  }
}
