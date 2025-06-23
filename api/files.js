import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET_NAME || "kabox-files";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract filename from URL path
    const urlPath = req.url || '';
    const filename = urlPath.split('/files/')[1];
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    // Download file from Supabase and serve it directly
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filename);
    
    if (error || !data) {
      return res.status(404).json({ error: "File tidak ditemukan" });
    }

    // Set proper headers based on file extension
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    const mimeTypes = {
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif',
      'webp': 'image/webp', 'svg': 'image/svg+xml', 'mp4': 'video/mp4', 'webm': 'video/webm',
      'avi': 'video/x-msvideo', 'mov': 'video/quicktime', 'wmv': 'video/x-ms-wmv',
      'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'flac': 'audio/flac', 'aac': 'audio/aac',
      'pdf': 'application/pdf', 'txt': 'text/plain', 'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel', 'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint', 'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'json': 'application/json', 'xml': 'application/xml', 'zip': 'application/zip',
      'rar': 'application/vnd.rar', '7z': 'application/x-7z-compressed'
    };
    
    if (ext && mimeTypes[ext]) {
      contentType = mimeTypes[ext];
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year cache
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // Convert blob to buffer and send
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
    
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: "Gagal mengakses file" });
  }
}