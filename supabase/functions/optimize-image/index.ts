
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const uniqueFilename = `${timestamp}_${safeName}`;
    const folderPath = detectedFileType === 'video' ? 'videos' : 'images';
    const filePath = `${folderPath}/${uniqueFilename}`;

    console.log('Uploading file to path:', filePath);

    // Upload original file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('File uploaded successfully:', uploadData);

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);

    console.log('Public URL generated:', publicUrl);

    // For images, try to get dimensions
    let width: number | undefined;
    let height: number | undefined;

    if (detectedFileType === 'image') {
      try {
        // Simple approach - we'll set default dimensions for now
        // In a production environment, you might want to use an image processing library
        width = 1920; // Default width
        height = 1080; // Default height
        console.log('Image dimensions set to default:', width, 'x', height);
      } catch (error) {
        console.log('Could not determine image dimensions, using defaults');
        width = 1920;
        height = 1080;
      }
    }

    // Create database record
    const imageData = {
      title: title || filename.replace(/\.[^/.]+$/, ''),
      description: description || null,
      alt_text: alt_text || null,
      category_id: category_id || null,
      original_url: publicUrl,
      webp_url: detectedFileType === 'image' ? publicUrl : null,
      thumbnail_url: publicUrl,
      medium_url: publicUrl,
      file_size: fileBuffer.byteLength,
      width: width,
      height: height,
      mime_type: mimeType,
      tags: tags || [],
      display_order: 0,
      is_featured: false,
      is_active: true,
      file_type: detectedFileType,
      video_url: detectedFileType === 'video' ? publicUrl : null,
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
      
      // Clean up uploaded file on database error
      await supabase.storage
        .from('gallery')
        .remove([filePath]);

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
          video_url: detectedFileType === 'video' ? publicUrl : undefined,
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
