
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageOptimizationRequest {
  file: string // base64 encoded image
  filename: string
  category_id: string
  title: string
  description?: string
  alt_text?: string
  tags?: string[]
}

interface OptimizedImage {
  original_url: string
  webp_url: string
  thumbnail_url: string
  medium_url: string
  width: number
  height: number
  file_size: number
}

async function resizeImage(
  imageData: Uint8Array,
  width: number,
  height: number
): Promise<Uint8Array> {
  // Create canvas for resizing
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  
  // Create image bitmap from data
  const blob = new Blob([imageData])
  const imageBitmap = await createImageBitmap(blob)
  
  // Draw resized image
  ctx.drawImage(imageBitmap, 0, 0, width, height)
  
  // Convert to WebP
  const webpBlob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.8 })
  return new Uint8Array(await webpBlob.arrayBuffer())
}

async function calculateDimensions(imageData: Uint8Array): Promise<{ width: number; height: number }> {
  const blob = new Blob([imageData])
  const imageBitmap = await createImageBitmap(blob)
  return { width: imageBitmap.width, height: imageBitmap.height }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { file, filename, category_id, title, description, alt_text, tags }: ImageOptimizationRequest = await req.json()
    
    // Decode base64 image
    const imageData = Uint8Array.from(atob(file), c => c.charCodeAt(0))
    
    // Get original dimensions
    const { width, height } = await calculateDimensions(imageData)
    
    // Generate unique filename
    const timestamp = Date.now()
    const baseFilename = filename.replace(/\.[^/.]+$/, '')
    const extension = 'webp'
    
    // Create different sizes
    const thumbnailData = await resizeImage(imageData, 300, Math.round((300 * height) / width))
    const mediumData = await resizeImage(imageData, 800, Math.round((800 * height) / width))
    const fullData = await resizeImage(imageData, width, height)
    
    // Upload files to storage
    const uploads = await Promise.all([
      supabase.storage
        .from('gallery')
        .upload(`original/${timestamp}-${baseFilename}.${extension}`, fullData, {
          contentType: 'image/webp',
          upsert: false
        }),
      supabase.storage
        .from('gallery')
        .upload(`webp/${timestamp}-${baseFilename}.${extension}`, fullData, {
          contentType: 'image/webp',
          upsert: false
        }),
      supabase.storage
        .from('gallery')
        .upload(`thumbnails/${timestamp}-${baseFilename}.${extension}`, thumbnailData, {
          contentType: 'image/webp',
          upsert: false
        }),
      supabase.storage
        .from('gallery')
        .upload(`medium/${timestamp}-${baseFilename}.${extension}`, mediumData, {
          contentType: 'image/webp',
          upsert: false
        })
    ])

    // Check for upload errors
    const uploadErrors = uploads.filter(upload => upload.error)
    if (uploadErrors.length > 0) {
      console.error('Upload errors:', uploadErrors)
      throw new Error('Failed to upload images')
    }

    // Get public URLs
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(`original/${timestamp}-${baseFilename}.${extension}`)
    
    const { data: { publicUrl: webpUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(`webp/${timestamp}-${baseFilename}.${extension}`)
    
    const { data: { publicUrl: thumbnailUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(`thumbnails/${timestamp}-${baseFilename}.${extension}`)
    
    const { data: { publicUrl: mediumUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(`medium/${timestamp}-${baseFilename}.${extension}`)

    // Save to database
    const { data: imageRecord, error: dbError } = await supabase
      .from('gallery_images')
      .insert({
        category_id,
        title,
        description,
        alt_text,
        original_url: originalUrl,
        webp_url: webpUrl,
        thumbnail_url: thumbnailUrl,
        medium_url: mediumUrl,
        file_size: fullData.length,
        width,
        height,
        mime_type: 'image/webp',
        tags: tags || []
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save image record')
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: imageRecord
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
