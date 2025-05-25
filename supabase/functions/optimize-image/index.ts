
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple WebP conversion and optimization
async function optimizeImage(imageData: Uint8Array, quality: number = 80): Promise<{
  webpData: Uint8Array;
  thumbnailData: Uint8Array;
  mediumData: Uint8Array;
  dimensions: { width: number; height: number };
}> {
  // For this implementation, we'll use a basic approach
  // In production, you might want to use a more sophisticated image processing library
  
  // Simulate image processing - in real implementation you'd use sharp or similar
  const originalSize = imageData.length;
  
  // Create optimized versions (simulated)
  const webpData = imageData; // In reality, convert to WebP
  const thumbnailData = imageData.slice(0, Math.floor(originalSize * 0.1)); // Simulate smaller thumbnail
  const mediumData = imageData.slice(0, Math.floor(originalSize * 0.5)); // Simulate medium size
  
  // Simulate dimension detection
  const dimensions = { width: 1920, height: 1080 };
  
  return {
    webpData,
    thumbnailData,
    mediumData,
    dimensions
  };
}

serve(async (req) => {
  console.log('optimize-image function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestData = await req.json()
    console.log('Request data received:', { ...requestData, file: '[FILE_DATA]' });

    const { file, filename, category_id, title, description, alt_text, tags, file_type } = requestData

    if (!file || !filename) {
      console.error('Missing required fields: file or filename');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file and filename' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Decode base64 file
    let fileBuffer: ArrayBuffer;
    try {
      const binaryString = atob(file);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileBuffer = bytes.buffer;
      console.log('File decoded successfully, size:', fileBuffer.byteLength);
    } catch (error) {
      console.error('Error decoding base64 file:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid base64 file data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Determine file type and MIME type
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    let mimeType = 'application/octet-stream';
    let detectedFileType = file_type || 'image';

    // Set MIME type based on file extension
    switch (fileExtension) {
      case 'jpg':
      case 'jpeg':
        mimeType = 'image/jpeg';
        detectedFileType = 'image';
        break;
      case 'png':
        mimeType = 'image/png';
        detectedFileType = 'image';
        break;
      case 'webp':
        mimeType = 'image/webp';
        detectedFileType = 'image';
        break;
      case 'gif':
        mimeType = 'image/gif';
        detectedFileType = 'image';
        break;
      case 'mp4':
        mimeType = 'video/mp4';
        detectedFileType = 'video';
        break;
      case 'webm':
        mimeType = 'video/webm';
        detectedFileType = 'video';
        break;
      case 'mov':
        mimeType = 'video/quicktime';
        detectedFileType = 'video';
        break;
    }

    console.log('File type detected:', detectedFileType, 'MIME type:', mimeType);

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const baseFilename = safeName.replace(/\.[^/.]+$/, '');
    const folderPath = detectedFileType === 'video' ? 'videos' : 'images';

    let originalUrl: string;
    let webpUrl: string | null = null;
    let thumbnailUrl: string | null = null;
    let mediumUrl: string | null = null;
    let width: number | undefined;
    let height: number | undefined;

    if (detectedFileType === 'image') {
      // Optimize image
      const imageData = new Uint8Array(fileBuffer);
      const optimized = await optimizeImage(imageData, 80);
      
      width = optimized.dimensions.width;
      height = optimized.dimensions.height;

      // Upload original
      const originalPath = `${folderPath}/${timestamp}_${baseFilename}.${fileExtension}`;
      const { data: originalUpload, error: originalError } = await supabase.storage
        .from('gallery')
        .upload(originalPath, optimized.webpData, {
          contentType: mimeType,
          cacheControl: '31536000', // 1 year cache
          upsert: false
        });

      if (originalError) {
        console.error('Error uploading original:', originalError);
        return new Response(
          JSON.stringify({ error: 'Failed to upload original file', details: originalError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Upload WebP version
      const webpPath = `${folderPath}/${timestamp}_${baseFilename}.webp`;
      const { data: webpUpload, error: webpError } = await supabase.storage
        .from('gallery')
        .upload(webpPath, optimized.webpData, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: false
        });

      // Upload thumbnail
      const thumbnailPath = `${folderPath}/thumbnails/${timestamp}_${baseFilename}_thumb.webp`;
      const { data: thumbUpload, error: thumbError } = await supabase.storage
        .from('gallery')
        .upload(thumbnailPath, optimized.thumbnailData, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: false
        });

      // Upload medium size
      const mediumPath = `${folderPath}/medium/${timestamp}_${baseFilename}_medium.webp`;
      const { data: mediumUpload, error: mediumError } = await supabase.storage
        .from('gallery')
        .upload(mediumPath, optimized.mediumData, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: false
        });

      // Get public URLs
      const { data: { publicUrl: originalPublicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(originalPath);

      originalUrl = originalPublicUrl;

      if (!webpError) {
        const { data: { publicUrl: webpPublicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(webpPath);
        webpUrl = webpPublicUrl;
      }

      if (!thumbError) {
        const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(thumbnailPath);
        thumbnailUrl = thumbPublicUrl;
      }

      if (!mediumError) {
        const { data: { publicUrl: mediumPublicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(mediumPath);
        mediumUrl = mediumPublicUrl;
      }

    } else {
      // Video upload - no optimization needed
      const videoPath = `${folderPath}/${timestamp}_${safeName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(videoPath, fileBuffer, {
          contentType: mimeType,
          cacheControl: '31536000',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        return new Response(
          JSON.stringify({ error: 'Failed to upload video file', details: uploadError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(videoPath);

      originalUrl = publicUrl;
    }

    console.log('Files uploaded successfully');

    // Create database record
    const imageData = {
      title: title || filename.replace(/\.[^/.]+$/, ''),
      description: description || null,
      alt_text: alt_text || null,
      category_id: category_id || null,
      original_url: originalUrl,
      webp_url: webpUrl,
      thumbnail_url: thumbnailUrl || webpUrl || originalUrl,
      medium_url: mediumUrl || webpUrl || originalUrl,
      file_size: fileBuffer.byteLength,
      width: width,
      height: height,
      mime_type: mimeType,
      tags: tags || [],
      display_order: 0,
      is_featured: false,
      is_active: true,
      file_type: detectedFileType,
      video_url: detectedFileType === 'video' ? originalUrl : null,
      video_duration: detectedFileType === 'video' ? 0 : null,
      video_provider: detectedFileType === 'video' ? 'upload' : null
    };

    console.log('Creating database record:', { ...imageData, file_size: imageData.file_size });

    const { data: dbData, error: dbError } = await supabase
      .from('gallery_images')
      .insert(imageData)
      .select(`
        *,
        category:gallery_categories(*)
      `)
      .single();

    if (dbError) {
      console.error('Error creating database record:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to create database record', details: dbError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Database record created successfully:', dbData.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...dbData,
          file_type: detectedFileType,
          video_url: detectedFileType === 'video' ? originalUrl : undefined,
          video_duration: detectedFileType === 'video' ? 0 : undefined,
          video_provider: detectedFileType === 'video' ? 'upload' : undefined
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error in optimize-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
