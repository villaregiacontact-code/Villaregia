import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && (supabaseAnonKey || supabaseServiceKey));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Upload a binary buffer to Supabase Storage bucket and return public URL
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  fileBuffer: Buffer | ArrayBuffer | Uint8Array,
  contentType: string
): Promise<{ url: string | null; error: any }> {
  if (!supabase || !isSupabaseConfigured) {
    return { url: null, error: new Error('Supabase is not configured in environment variables') };
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      // If bucket does not exist, try creating it with public access
      if (error.message?.includes('not found') || (error as any).statusCode === '404' || (error as any).error === 'Bucket not found') {
        try {
          await supabase.storage.createBucket(bucket, { public: true });
          const retry = await supabase.storage.from(bucket).upload(path, fileBuffer, {
            contentType,
            upsert: true,
          });
          if (retry.error) return { url: null, error: retry.error };
        } catch (bucketErr) {
          return { url: null, error: bucketErr };
        }
      } else {
        return { url: null, error };
      }
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: err };
  }
}
