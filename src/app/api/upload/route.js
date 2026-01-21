// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabaseServer } from "@/lib/supabaseServer";

// Increase body size limit for documents
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};

export const maxDuration = 60; // Max function duration (Vercel)
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const supabase = await supabaseServer();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("[Upload] Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const fileType = form.get("fileType"); // "image" | "document" | "floorplan"
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine bucket based on file type
    let bucket = "property-documents"; // default
    if (fileType === "image") {
      bucket = "property-images";
    }

    // Sanitize filename - remove special characters
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
    
    const filename = `${Date.now()}-${sanitizedName}`;

    console.log("[Upload] Starting upload:", {
      originalName: file.name,
      sanitizedName: filename,
      fileType: file.type,
      size: file.size,
      bucket: bucket
    });

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 50MB" 
      }, { status: 400 });
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[Upload] Buffer created: ${buffer.length} bytes`);

    // Determine content type - be more specific for documents
    let contentType = file.type || 'application/octet-stream';
    
    // Override content type for common document formats if browser doesn't provide it
    if (!file.type || file.type === 'application/octet-stream') {
      const ext = sanitizedName.split('.').pop()?.toLowerCase();
      const mimeTypes = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'csv': 'text/csv'
      };
      contentType = mimeTypes[ext] || 'application/octet-stream';
      console.log(`[Upload] Content type set by extension: ${contentType}`);
    }

    // Try upload with retries
    let uploadAttempt = 0;
    let uploadError = null;
    let uploadData = null;

    while (uploadAttempt < 3) {
      uploadAttempt++;
      console.log(`[Upload] Attempt ${uploadAttempt}/3`);

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filename, buffer, { 
          upsert: false,
          contentType: contentType,
          cacheControl: '3600',
          duplex: 'half' // Important for large files
        });

      if (!error) {
        uploadData = data;
        break;
      }

      uploadError = error;
      console.error(`[Upload] Attempt ${uploadAttempt} failed:`, {
        message: error.message,
        statusCode: error.statusCode,
        name: error.name
      });

      // Don't retry on permission errors
      if (error.statusCode === 403 || error.statusCode === 401) {
        break;
      }

      // Wait before retry
      if (uploadAttempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempt));
      }
    }

    if (uploadError) {
      console.error("[Upload] Final error:", {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        bucket: bucket,
        attempts: uploadAttempt
      });

      // Check if it's a bucket access issue
      if (uploadError.statusCode === 403) {
        // Try to list buckets to verify access
        const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
        console.error("[Upload] Bucket list check:", {
          availableBuckets: buckets?.map(b => b.name),
          targetBucket: bucket,
          listError: listError?.message
        });
      }

      return NextResponse.json({ 
        error: uploadError.message || "Upload failed",
        statusCode: uploadError.statusCode,
        bucket: bucket
      }, { status: uploadError.statusCode || 500 });
    }

    if (!uploadData?.path) {
      console.error("[Upload] No path returned");
      return NextResponse.json({ 
        error: "Upload failed - no path returned" 
      }, { status: 500 });
    }

    console.log(`[Upload] Success: ${uploadData.path}`);

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    console.log(`[Upload] Public URL: ${publicUrl}`);

    return NextResponse.json({ 
      file: publicUrl,
      path: uploadData.path,
      bucket: bucket
    });
    
  } catch (err) {
    console.error("[Upload] Exception:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return NextResponse.json({ 
      error: err.message || "Upload failed" 
    }, { status: 500 });
  }
}